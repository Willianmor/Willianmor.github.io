export class Maps {
    constructor(center_map,confsvg) {
        // center_map = [-57.82134,-5.15357]
        // scale:this.scale

        this.config = confsvg;
        this.svg = null;

        this.center_map = center_map;
        this.scale = this.config.height/2.3*Math.PI;
        this.projection = null;
        this.path = null;
        this.data = null;
        this.dataGeo = null;

        this.createSvg();
        
    }

    clean() {
        this.data = null;
        this.dataGeo = null;
        this.config = null;
        this.svg.remove()
        this.svg = null;
        this.projection = null;
    }

    initData(data, dataGeo) {
        this.data = data;
        this.dataGeo = dataGeo;
    }

    createSvg() {
        this.svg = d3.select(this.config.div)
            .append("svg")
            .attr('id', 'svg')
            .attr('x', 10)
            .attr('y', 10)
            .attr('width', this.config.width + this.config.left + this.config.right)
            .attr('height', this.config.height + this.config.top + this.config.bottom)
            .attr('class', 'card');
    }

    async setData(data) {
        this.data = data
        // // console.log(this.data)
    }


    render(data_mapa, attributes, name_attribute) {
        // Map and projection
        
        this.projection = d3.geoMercator()
                            .rotate([0,0])
                            .center(this.center_map)      // GPS of location to zoom on
                            .scale(this.scale)                       // This is like the zoom:https://bl.ocks.org/mbostock/3757119
                            //.scale(this.scale)                       // This is like the zoom
                            .translate([ this.config.width/2, this.config.height/2 ])
        this.path = d3.geoPath()
                    .projection(this.projection);
                    
        
        // Draw the map
        this.svg.append("g")
                .selectAll("path")
                .data(data_mapa.features)
                .enter().append("path")
                    .attr("fill", "#b8b8b8")
                    .attr("d", this.path)
                    .style("stroke", "black")
                    .style("stroke-width", 0.5)
                    .style("opacity", .3)
                .append("title")
                    .text(d => `${d.properties.ESTADO}`);;

        
        // Add data de quemadas
        // Filter data
        // console.log("---", data_mapa)
                
        this.nested = []
        
        //let region = "RJ"
        for (let i=0; i<data_mapa.features.length; i++) {
            let region = data_mapa.features[i].properties.ESTADO
            let variables = attributes[region].variables
            let idx_var = -1
            // console.log("****:",region)
            // Pesquisar o indíce da variável
            for (let i=0; i< variables.length; i++) {
                if (variables[i].name==name_attribute){
                    idx_var = i
                    break
                }
            }
            // TODO: if idx_var == -1: try+exception(..)
            let tono_color = variables[idx_var].colorranger_classify
            let data_filter = data_mapa.features.filter( d =>  d.properties.ESTADO==region);
            
            // if(region=="SP"){
            //     console.log("SP:",variables[idx_var])
            // }
            this.nested.push({'key':variables[idx_var].rangeclasse,'color':tono_color})
            
            this.svg.selectAll("myPath")
                    .data(data_filter)
                    .enter()
                    .append("path")
                        .attr("fill", tono_color)
                        .attr("d", this.path)
                        .style("stroke", "black")
                        .style("stroke-width", 1)
                        .style("opacity", .7)
                        
        }
        this.renderScaleBar();
        this.svg.exit().remove();
        
    }


    renderMapLegend (legends, title) {

        //ranges 

        //cores do ranges 
        //let nested = unique //[{'key':'Rio de Janeiro','color':'red'}, {'key':'SP','color':'black'},{'key':'MG','color':'blue'}]

        
        //Elimina os _ ou - das strings do título
        if (title.search('_') ){
            var newTitle = title.replace('_',' ')
        } else if (title.search('-')) {
            var newTitle = title.replace('-',' ')
        }
                

        this.svg.append("text")
        .attr("x", this.config.width)             
        .attr("y", this.config.height*0.05) 
        .style("font-size", "16px")
        .style('text-anchor', 'end') 
        .attr("font-weight", "bold")
        .text(newTitle);

        //Cores dos intervalos
        let nested = legends[title]

        var legend = this.svg.selectAll('.legend').data(nested)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) { return 'translate(0,' + i * 12 + ')'; });
    
        legend.append('rect')
            .attr('x', this.config.width*0.75)
            .attr('y', this.config.height - this.config.bottom + 10)
            .attr('width', 12)
            .attr('height', 11)
            .attr("alignment-baseline","middle")
            .attr('stroke-width', 1)
            .attr('fill', function(d) { return d.color;});
    
        legend.append('text')
            .attr('x', this.config.width*0.78)
            .attr('y', this.config.height - this.config.bottom)
            .attr('dy', '1.5em')
            .attr("alignment-baseline","middle")
            .style('text-anchor', 'start')
            .attr("font-weight", "bold")
            .style('font-size', '12px')
            .text(function(d) { return d.key; });
    
    }

    renderScaleBar(){
        //Render Scale bar
        let xScalerBar = this.config.width*0.25
        let yScaleBar = this.config.height
        let kilometers = d3.geoScaleBar()
                    .left(.2)
                    .top(.97)
                    .distance(2000);
        let scaleBarKilometers = this.svg.append("g")
            .attr("transform", "translate(0, 40)");

        kilometers.extent([xScalerBar, yScaleBar]).projection(this.projection);
        scaleBarKilometers.call(kilometers);
    }


}