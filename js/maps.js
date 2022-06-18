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
                    //.style("opacity", .3)
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
            let tono_color = variables[idx_var].ColorScale
            let data_filter = data_mapa.features.filter( d =>  d.properties.ESTADO==region);
            
            // if(region=="SP"){
            //     console.log("SP:",variables[idx_var])
            // }
            this.nested.push({'key':variables[idx_var].rangeclasse,'color':tono_color})

            //console.log(this.nested)
            
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

    //Necessário normalizar os valores.
    createAttributeStructure(input_attributes,min,max){ //input: attributes -> List
        //Lista de dicionários -> Criando para plotar vários radares em uma mesmo Radar.
        this.attributes = [] // => [ {x1:valor1,x2:valor2,...}, {x1:valor1,x2:valor2,...}]
        this.name_attributes = []

        //console.log(input_attributes,min,max)

        //Input_attributes é uma lista com os Nomes dos atributos
        //Lista de valores

        let ticks = [1,1,1]
        //let ticks = [0,1,1*0.7,1]
        //Se for normalizar os dados pela população
        for(let k=0; k<ticks.length ; k++){
            
            let att = {}
            for(let i=0; i<input_attributes.length ; i++){
                
                let name = input_attributes[i]
                //console.log(input_attributes,min[name],max[name])
                var value = -1
                if(k==0){//minimo
                    value =  Math.round(min[name])
                    //console.log("Entrou em minimo")
                }else if (k>0 && k<ticks.length-1){
                    value = Math.round((max[name]+min[name])/2)//Math.round((this.max_values[name]-this.min_values[name])*ticks[k])
                    //console.log("Entrou em intermediário")
                }else {//maximo
                    value =  Math.round(max[name]*ticks[k])
                    //console.log("Entrou em maximo")
                }
                //console.log("----------------------------------------",this.max_values[name],  this.max_values[name])
                att[name] = value 
                
            }
            this.attributes.push(att)
        }
        this.name_attributes = input_attributes
        //console.log("*-*-*-*-*-*-*-",this.name_attributes)
        //console.log("*-*-*-*-*-*-*-",this.attributes)
    }
    


    renderMapLegend (min, max, mean, title, color) {

        // //ranges 

        // //cores do ranges 
        // //let nested = unique //[{'key':'Rio de Janeiro','color':'red'}, {'key':'SP','color':'black'},{'key':'MG','color':'blue'}]

        let newTitle1 = title.split("-")[0]
        let newTitle2 = title.split("-")[1] 

        let title1 = newTitle1.replaceAll('_',' ')
        let title2 = "("+newTitle2.replaceAll('_',' ')+")"
        
                

        this.svg.append("text")
        .attr("x", this.config.width*0.81)             
        .attr("y", this.config.height*0.7) 
        .style("font-size", "12px")
        //.style('text-anchor', 'end') 
        .attr("font-weight", "bold")
        .text(title1);


        this.svg.append("text")
        .attr("x", this.config.width*0.81)             
        .attr("y", this.config.height*0.75) 
        .style("font-size", "12px")
        //.style('text-anchor', 'end') 
        .attr("font-weight", "bold")
        .text(title2);

        //Cores dos intervalos
        //let nested = legends[title]
        //let min = 8
        //let max = 25
        let max_barH = 100
        let h_bar_i = 1.7

        let nested = [min] //legends[title]
        let aux = (max-min)/max_barH
        for(let j=1; j<max_barH-1; j++){
            nested.push(nested[j-1] + aux)
        }
        nested.push(max)

        
        let textlabel_min_max = [d3.min(nested),d3.max(nested)].reverse()
        let textlabel_mean = [mean]
        let mean_Scale = (max - mean)*max_barH/(max-min)
        
        //console.log("*/*/*//*//*/*/*/*",textlabel_min_max)

        var legend = this.svg.selectAll('.legend').data(nested)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) { return 'translate(0,' + i * 1 + ')'; });
            
        // https://stackoverflow.com/questions/56090105/how-to-invert-d3-color-ramps-d3-scale-chromatic-d3-interpolateviridis
        let fun_color_scale = this.calculateColorScale(max,min,color)

        
        legend.append('rect')
            //.attr('x', this.config.width*0.75)
            .attr('x', this.config.width*0.85)
            .attr('y', (this.config.height - this.config.bottom - 0.3*max_barH))
            .attr('width', 20)
            .attr('height', h_bar_i)
            //.attr("alignment-baseline","middle")
            .attr('stroke-width', 0)
            .attr('fill', function(d) { return fun_color_scale(d);});

        //Borda da Barra
        let Label_and_border = this.svg.selectAll('.legend_border').data(textlabel_min_max)
            .enter().append('g')
            .attr('class', 'legend_border')
        
            Label_and_border.append('rect')
            //.attr('x', this.config.width*0.75)
            .attr('x', this.config.width*0.85)
            .attr('y', (this.config.height - this.config.bottom - 0.3*max_barH))
            .attr('width', 20)
            .attr('height', max_barH)
            .attr('stroke-width', 1)
            .attr('stroke',"Black")
            .attr('fill', "none");

            let side = this.config.width*1.5/100

            Label_and_border.append('text')
            .attr('transform', function(d, i) { return 'translate(0,' + i * max_barH + ')'; })
            //.attr('x', this.config.width*0.79 + side/2)
            .attr('x', this.config.width*0.91 + side/2)
            .attr('y', this.config.height - this.config.bottom - 0.3*max_barH)
            .attr('dy', '0.5em')
            .style('text-anchor', 'start')
            .attr("font-weight", "bold")
            .style('font-size', '11px')
            .text(function(d) {return d.toString()});

            Label_and_border.append('line')
                .attr('transform', function(d, i) { return 'translate(0,' + i * max_barH + ')'; })
                //.attr("x1", this.config.width*0.78)
                .attr("x1", this.config.width*0.85)
                .attr("y1", this.config.height - this.config.bottom - 0.3*max_barH)
                //.attr("x2", this.config.width*0.79 + side/2)
                .attr("x2", this.config.width*0.91 + side/2)
                .attr("y2", this.config.height - this.config.bottom - 0.3*max_barH)
                .attr("stroke","black")
                .attr('stroke-width', 2);

        //Text label mean
        //Borda da Barra
        let Label_and_border_mean = this.svg.selectAll('.legend_border_mean').data(textlabel_mean)
            .enter().append('g')
            .attr('class', 'legend_border_mean')
        Label_and_border_mean.append('text')
            //.attr('x', this.config.width*0.79 + side/2)
            .attr('x', this.config.width*0.91 + side/2)
            .attr('y', this.config.height - this.config.bottom - 0.3*max_barH + mean_Scale)
            .attr('dy', '0.5em')
            .style('text-anchor', 'start')
            .attr("font-weight", "bold")
            .style('font-size', '11px')
            .text(function(d) {return d.toString()});

        Label_and_border_mean.append('line')
            //.attr("x1", this.config.width*0.78)
            .attr("x1", this.config.width*0.89)
            .attr("y1", this.config.height - this.config.bottom - 0.3*max_barH + mean_Scale)
            //.attr("x2", this.config.width*0.79 + side/2)
            .attr("x2", this.config.width*0.91 + side/2)
            .attr("y2", this.config.height - this.config.bottom - 0.3*max_barH + mean_Scale)
            .attr("stroke","black")
            .attr('stroke-width', 2);

    }

    calculateColorScale (Lim_inf,Lim_sup, current_color){
        let color_base = "#ffffff"
        let ColorScale = d3.scaleSequential()
        .domain([Lim_inf,Lim_sup]) //Domínio do dado (0 até o limite máximo de cada eixo)
        .interpolator(d3.interpolateRgb(color_base,current_color));    //Valor pixel,this.config.width/14 = 14,5.   [14,50] 
        //Quando range min = this.config.width/14, está dando erro na escala da legenda.
        return ColorScale;
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