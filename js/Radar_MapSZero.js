import { RadarChart } from "./Radar_ChartSZero.js";

export class RadarMap {
    constructor(center_map,confsvg) {
        
        this.config = confsvg;
        this.svg = null;

        this.center_map = center_map;
        this.scale = this.config.height/2.2*Math.PI;
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

    render(data_mapa, datacovid_fstructure, max_value,min_value) {
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

        // Draw radar by region
        for (let i=0; i<data_mapa.features.length; i++) {
            let region = data_mapa.features[i].properties.ESTADO

            //Atributos

            //Valores máximos das variáveis

            //SVG - JÁ TEM!!
            
            //Centróides
            //if (region=="PA"){
                let att_region = datacovid_fstructure[region]
                //console.log("--------",region)
                //console.log("--------  centroide original", att_region.centroide)
                //console.log("-------- centroide projection ",projection(att_region.centroide))
                let centroids = this.projection(att_region.centroide)
                let radar_Chart = new RadarChart([att_region],max_value,min_value, this.svg, centroids)
                radar_Chart.render()
            //}
            
            //break
        
        }
        this.renderScaleBar(); 
        this.svg.exit().remove();
    }

    //Valores máximos e minimos de todas as variávesis
    //V1 - Minv1, MaxV1, MedioV1, mais dois valores porporcionais => V1 = [0,Minv1,25%v1,MedioV1,75%v1,MaxV1]
    //V2
    //V3
    //v4
    //Nomes das variáveis
    

    renderMapLegend (att_region, max_value,min_value, mean_value, title) {

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

        let centroids = [this.config.width*0.85,this.config.height*0.80]
        //let att_region = null
        let config_radar = {width: 200, height: 200}


        
                
        let radar_Chart = new RadarChart(att_region,max_value,min_value, this.svg, centroids, config_radar,true)
        radar_Chart.render()

        //
        var k = 0
        for(let i=0; i<radar_Chart.name_attributes.length;i++){
            let name = radar_Chart.name_attributes[i]
                      
            if (i<5){
                var translateAxes = {'x':-0.18*this.config.width+0.08*k*this.config.width,'y':+0.15*this.config.height}
            } else {
                if (i==5){k = 0}
                var translateAxes = {'x':-0.18*this.config.width+0.08*k*this.config.width,'y':+0.23*this.config.height}
            } 
            k += 1
            
            this.createAxesLegend(min_value[name],max_value[name], mean_value[name],radar_Chart, i, name,translateAxes, centroids)
            //break
        }
        

    }
    

    //Lista de atributos this.attributes
   createAxesLegend (datamin, dataMax, dataMean, radar_Chart, i, name,translate,centroids) {

        let line_coordinate = radar_Chart.angleToCoordinate(Math.PI/2,dataMax, true, i)
        let label_coordinate = radar_Chart.angleToCoordinate(Math.PI/2,dataMax + 0.5, true, i); 

        let x = centroids[0]
        let y = centroids[1]
            
        this.svg.append("line")
        .attr("x1", x + translate.x)
        .attr("y1", y + translate.y)
        //precisamos desenhar uma linha para cada variável do mapa.
        .attr("x2", line_coordinate.x + translate.x)
        .attr("y2", line_coordinate.y + translate.y)
        .attr("stroke","black");

        
        
        this.svg.append("text")
        .attr("x", label_coordinate.x + translate.x)
        .attr("y", label_coordinate.y + translate.y - 20)
        .style('text-anchor', 'middle')
        .attr("alignment-baseline","middle")
        .attr("font-weight", "bold")
        .style('font-size', '9px')
        .text(radar_Chart.clearTitle(name));

        //tick = [0,min,medida,max]
        //Calculando as variáveis intermediárias do Radar Chart
        let variable2 = dataMean//Math.round((dataMax+datamin)/2)
        

        
        var ticks = [datamin,variable2,dataMax];

        
        
        //Plotando os ticks
        // ticks.forEach(t =>
        //     this.svg.append("line")
        //     .attr("x1", x + translate.x + (5*100*2)/this.config.width)
        //     .attr("y1", y + translate.y  - radar_Chart.list_radial_scale[i](t))
        //     .attr("x2", x + translate.x + (5*100*2)/this.config.width-5)
        //     .attr("y2", y + translate.y - radar_Chart.list_radial_scale[i](t))
        //     .attr("stroke","black")
        // );

        // ticks.forEach(t =>
        //     this.svg.append("text")
        //     .attr("x", x + translate.x + (5*100*2)/this.config.width)
        //     .attr("y", y + translate.y - radar_Chart.list_radial_scale[i](t))
        //     .text(t.toString())
        //     .style('font-size', '9px')
        //     .attr("font-weight", "bold")
        // );
        let distance = y + translate.y  - radar_Chart.list_radial_scale[i](ticks[0])
        let distance2 = y + translate.y  - radar_Chart.list_radial_scale[i](ticks[ticks.length-1])
        let distancetotal = distance - distance2
        //Razao que representa 10 por cento do valor do pixel dessa legenda que vale 50 pixel para esse tamanho de SVG
        let r= distancetotal*0.1
        console.log("*-*-*-*-*-*-*- distancetotal:", distancetotal, r)
        for (let k=0; k<ticks.length;k++){
            let t = ticks[k]

            let x1 = x + translate.x + (5*100*2)/this.config.width
            let y1 = y + translate.y - radar_Chart.list_radial_scale[i](t)

            if (k<ticks.length-1){
                let y1_ = y + translate.y  - radar_Chart.list_radial_scale[i](ticks[k+1]) // condicional to add
                
                //console.log('*-*-*-*-*-   ticks distance:',  r =y1_/y1)
                
                if (y1-y1_>r){
                    this.svg.append("line")
                    .attr("x1", x1)
                    .attr("y1", y1)
                    .attr("x2", x + translate.x + (5*100*2)/this.config.width-5)
                    .attr("y2", y + translate.y - radar_Chart.list_radial_scale[i](t))
                    .attr("stroke","black")

                    this.svg.append("text")
                    .attr("x", x1)
                    .attr("y", y1)
                    .text(t.toString())
                    .style('font-size', '9px')
                    .attr("font-weight", "bold")
                }
            }else if(k==ticks.length-1){
                this.svg.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x + translate.x + (5*100*2)/this.config.width-5)
                .attr("y2", y + translate.y - radar_Chart.list_radial_scale[i](t))
                .attr("stroke","black")

                this.svg.append("text")
                .attr("x", x1)
                .attr("y", y1)
                .text(t.toString())
                .style('font-size', '9px')
                .attr("font-weight", "bold")
            }
        }

    
    }

    renderScaleBar(){
        //Render Scale bar
        let xScalerBar = this.config.width*0.25
        let yScaleBar = this.config.height
        let kilometers = d3.geoScaleBar()
                    .left(.2)
                    .top(.95)
                    .distance(1200);
        let scaleBarKilometers = this.svg.append("g")
            .attr("transform", "translate(0, 40)");

        kilometers.extent([xScalerBar, yScaleBar]).projection(this.projection);
        scaleBarKilometers.call(kilometers);
    }


}