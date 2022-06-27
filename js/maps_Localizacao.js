//Importando a biblioteca que calcula o centróide
import {polylabel} from "./lib/polylabel.js";

export class Maps {
    constructor(center_map,confsvg, file_map) {
        // center_map = [-57.82134,-5.15357]
        // scale:this.scale

        this.config = confsvg;
        this.svg = null;

        this.center_map = center_map;
        this.scale = this.config.height/2.3*Math.PI;
        this.projection = null;
        this.path = null;
        this.data = null;
        this.dataGeo2 = null;
        this.filenamemaps = file_map;

        
        this.createSvg();
        this.loadData();
        
    }

    //Método da Classe Data que carrega o dado - load Promise é o método que apoia no carregamento do dado. Só carrega a próxima função depois que carregar o dado completo.
    loadData() {
        this._loadDataPromise();        
    }
    
    async _loadDataPromise() {
        let [data_mapa] = await Promise.all([
            d3.json(this.filenamemaps)
        ])
        this.dataGeo = data_mapa;
        this.render()
        this.renderMapLegend()
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

    


    render() {
        let data_mapa = this.dataGeo
        console.log(data_mapa.features)
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
                    //.attr("fill", "#b8b8b8")
                    .attr('class',d => `${d.properties.Regiao}`)
                    .attr("d", this.path)
                    .attr("opacity", .3)
                    .style("stroke", "black")
                    .style("stroke-width", 0.5)
                    .style("opacity", .3)
                .append("title")
                    .text(d => `${d.properties.Nome_Estado}`);;

        
        
        this.svg.selectAll("text")
                .data(data_mapa.features)
                .enter()
                .append("text") // append text
                    .attr("x", function(d) {
                        console.log(d.properties.ESTADO, this.getCentroide(d.geometry.coordinates[0])[0])
                        return this.projection(this.getCentroide(d.geometry.coordinates[0]))[0];
                    }.bind(this))
                    .attr("y", function(d) {
                        return this.projection(this.getCentroide(d.geometry.coordinates[0]))[1];
                    }.bind(this))
                    .attr("dy", +3) // set y position of bottom of text
                    .style("fill", "black") // fill the text with the colour black
                    .attr("font-weight", "bold")
                    .style('font-size', '12px')
                    // .attr("text-anchor", "middle") // set anchor y justification
                    .text(function(d) {return d.properties.ESTADO;}); // define the text to display

        this.svg.exit().remove();
        
    }


    getCentroide(dataset_mapa, precision=1.0){
        let centroide = polylabel(dataset_mapa, precision);
        return centroide.slice(0,2)
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


    renderMapLegend () {

        //ranges 

        //cores do ranges 
        //let nested = unique //[{'key':'Rio de Janeiro','color':'red'}, {'key':'SP','color':'black'},{'key':'MG','color':'blue'}]

        let nested = [{'key':'Norte'}, {'key':'Sul'},{'key':'Sudeste'},{'key':'Nordeste'},{'key':'Centro-Oeste'}]
        
        //Elimina os _ ou - das strings do título
        // if (title.search('_') ){
        //     var newTitle = title.replace('_',' ')
        // } else if (title.search('-')) {
        //     var newTitle = title.replace('-',' ')
        // }
                

        // this.svg.append("text")
        // .attr("x", this.config.width)             
        // .attr("y", this.config.height*0.05) 
        // .style("font-size", "16px")
        // .style('text-anchor', 'end') 
        // .attr("font-weight", "bold")
        // .text(newTitle);

        //Cores dos intervalos
        //let nested = legends[title]
        let newTitle = "Mapa de Localização das Unidades Federativas"

        this.svg.append("text")
        .attr("x", this.config.width*0.86)             
        .attr("y", this.config.height*0.02) 
        .style("font-size", "16px")
        .style('text-anchor', 'end') 
        .attr("font-weight", "bold")
        .text(newTitle);

        var legend = this.svg.selectAll('.legend').data(nested)
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) { return 'translate(0,' + i * 12 + ')'; });
    
        legend.append('rect')
            .attr('x', this.config.width*0.75)
            .attr('y', this.config.height - this.config.bottom + 10)
            .attr('width', 14)
            .attr('height', 12.5)
            .attr("alignment-baseline","middle")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .attr('stroke', 1)
            .attr('class', d => `${d.key}`)
            .attr("opacity", .3)
            //.attr('fill', function(d) { return d.color;});
    
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


}