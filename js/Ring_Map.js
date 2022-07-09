//import {  } from "./.js";

function createNewTitle(title){
    var newtitle=title
    if (title.search('_') ){
        newtitle = title.replace('_',' ')
    } else if (title.search('-')) {
        newtitle = title.replace('-',' ')
    }

    return  newtitle;
}
export class RingMap {
    constructor(center_map,confsvg, len_att) {
        
        this.config = confsvg;
        this.svg = null;

        this.center_map = center_map;
        if (len_att>=3 && len_att<=5){
            this.scale = this.config.height/7*Math.PI;
        }
        else if (len_att>5 && len_att<=10) {
            this.scale = this.config.height/11*Math.PI;
        }
        else {
            alert("Número de variáveis inadequado")
        }

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
  
    calculateAngle(len_list_regions,i){
        let angle = (Math.PI / 2) + (Math.PI/2 * i / len_list_regions);
        return angle;
    }

    angleToCoordinate(angle,maxlatlong){

        //let coordinateMaxRegion =[0.307881,-47.322709]
        let projectionMaxVetor = this.projection(maxlatlong)
        //console.log("(((((((((((((((((((((((((((((((VALORMAXLAT",projectionMaxVetor,this.cx, this.cy)
        let radio = Math.abs(this.cy - projectionMaxVetor[1])
        var vetor = radio + radio*.6 //+ 160 // Math.abs(this.cx -32.391074)
          
        console.log(vetor)
        //Calcula as coordenadas x e y a partir das escalas, angulos e considera o centro do SVG
        let x = Math.sin(angle) * vetor;
        let y = Math.cos(angle) * vetor;
           
        //This.x e Thix.y são dos valores dos centróides. x e y são calculados a partir do angulo que é calculado com o número de variáveis para construir o radar.
        return {"x": this.cx + x, "y": this.cy - y};
    }


    createOrderedRegions(center_map, data_mapa, final_structure){
        // output: ["RJ",..]
        //Coordenadas do centro da região Total
        let cx = center_map[0] //this.meanmaxminlong
        let cy = center_map[1] //this.meanmaxminlat

        var order_regions_q1 = []
        var order_regions_q2 = []
        var order_regions_q3 = []
        var order_regions_q4 = []
        for (let i=0; i< data_mapa.features.length; i++) {
            let region = data_mapa.features[i].properties.ESTADO

            // //obter o this.final_structure 
            var centroid = final_structure[region].centroide 
            // centroid[0] = longitude
            // centroid[1] =latitude

            let llong = centroid[0]
            let llat = centroid[1]

            let dx = llong - cx
            let dy = llat - cy

            //Global Regions
            //regiones.push([region, llong, llat]) //(region, long, latt)

            //1 Quadrante
            if (final_structure[region].Quadrante==1) {
                order_regions_q1.push({
                    "region":region,
                    "llong": llong,
                    "llat": llat,
                    "angle": Math.atan2(dy, dx) * 180 / Math.PI //angle in degrees
                })
            }

            //2 quadrante
            if (final_structure[region].Quadrante==2) {
                order_regions_q2.push({
                    "region":region,
                    "llong": llong,
                    "llat": llat,
                    "angle": Math.atan2(dy, dx) * 180 / Math.PI //angle in degrees
                })
            }

            //3 quadrante
            if (final_structure[region].Quadrante==3) {
                order_regions_q3.push({
                    "region":region,
                    "llong": llong,
                    "llat": llat,
                    "angle": Math.atan2(dy, dx) * 180 / Math.PI //angle in degrees
                })
            }

            //4 quadrante
            if (final_structure[region].Quadrante==4) {
                order_regions_q4.push({
                    "region":region,
                    "llong": llong,
                    "llat": llat,
                    "xCoordinate":0,
                    "yCoordinate":0,
                    "angle": Math.atan2(dy, dx) * 180 / Math.PI //angle in degrees
                })
            }
            
        }
        
        var order_regions_qn = [order_regions_q1, order_regions_q2, order_regions_q3,order_regions_q4]

        for (let i=0; i< order_regions_qn.length; i++) {
            order_regions_qn[i].sort(function(a, b) {
                if (a.angle>b.angle){return -1} // if(a.llat>b.llat && a.llong < b.llong){return 1}) //menor
                else {return +1} //menor
            })
        }

        console.log("SORT:", order_regions_qn)
        return order_regions_qn

    }

    getLineCoordinateByQn(regions, angle_aux, maxlatlong){
        var line_coordinates = []
        for (let i=0; i< regions.length; i++) {
            let angle = this.calculateAngle(regions.length,i)
            line_coordinates.push(this.angleToCoordinate(angle+angle_aux, maxlatlong))
        }
        return line_coordinates
    }

    
    render_x(maxlatlong, data_mapa, final_structure){
        let order_regions_qn = this.createOrderedRegions(this.center_map, data_mapa, final_structure)

        let projection  = this.projection(this.center_map)
        console.log(this.center_map)
        this.cx = projection[0]   //Alterado para melhorar a distribuição
        this.cy = projection[1]   //Alterado para melhorar a distribuição

        var line_coordinates_qn = []
        for (let i=0; i< order_regions_qn.length; i++) {
            var angle_aux = 0
            if (i==0){ // quadrante 1
                angle_aux = -Math.PI/2
            } else if (i==1){// quadrante 2
                angle_aux = 0
            } else if (i==2){// quadrante 3
                angle_aux = -3*Math.PI/2
            } else {// quadrante 4
                angle_aux = -Math.PI
            }
            console.log("*-*-*-*-*-",i,order_regions_qn[i].length)
            line_coordinates_qn.push(this.getLineCoordinateByQn(order_regions_qn[i], angle_aux,maxlatlong ))
        }

        // Corrigir intersecao
        for (let qn=0;qn < 4; qn++){

            for (let i=0; i< order_regions_qn[qn].length-1; i++) {
                
                let centroidRegionprojection = this.projection([order_regions_qn[qn][i].llong,order_regions_qn[qn][i].llat])
                let a = {'x':centroidRegionprojection[0],'y':centroidRegionprojection[1]}
                let b = line_coordinates_qn[qn][i]
                let centroidRegionprojection1 = this.projection([order_regions_qn[qn][i+1].llong,order_regions_qn[qn][i+1].llat])
                let c =  {'x':centroidRegionprojection1[0],'y':centroidRegionprojection1[1]}
                let d = line_coordinates_qn[qn][i+1]
                let intersection = this.intersection(a, b, c, d)
                                
                if (intersection.isIntersection){
                    console.log("INTERSEÇA********************/",intersection)
                    // [a,b] [c,d]  ==> [a,d] [c,b]
                    // Troca de coordenadas
                    let aux = line_coordinates_qn[qn][i] //b
                    line_coordinates_qn[qn][i] = line_coordinates_qn[qn][i+1]
                    line_coordinates_qn[qn][i+1] = aux

                    //Troca de coordenadas
                    let auxangle = order_regions_qn[qn][i].angle
                    order_regions_qn[qn][i].angle = order_regions_qn[qn][i+1].angle
                    order_regions_qn[qn][i+1].angle = auxangle

                }
                //
            }
            //break
        }


        // Desenhar Linhas pretas para teste
        //let qn = 1
        for (let qn=0;qn < 4; qn++){
            // for (let i=0; i< line_coordinates_qn[qn].length; i++) {
                
            //     this.svg.append("line")
            //         .attr("x1", this.cx)
            //         .attr("y1", this.cy)
            //         //precisamos desenhar uma linha para cada variável do mapa.
            //         .attr("x2", line_coordinates_qn[qn][i].x)
            //         .attr("y2", line_coordinates_qn[qn][i].y)
            //         .attr("stroke","black");
                
            // }

            //Linhas vermelhas para teste
            for (let i=0; i< order_regions_qn[qn].length; i++) {
                let centroidRegionprojection = this.projection([order_regions_qn[qn][i].llong,order_regions_qn[qn][i].llat])
                
                
                this.svg.append("line")
                    .attr("x1", centroidRegionprojection[0])
                    .attr("y1", centroidRegionprojection[1])
                    //precisamos desenhar uma linha para cada variável do mapa.
                    .attr("x2", line_coordinates_qn[qn][i].x)
                    .attr("y2", line_coordinates_qn[qn][i].y)
                    .attr("stroke","gray");

                // save line coordinates by quadrant into region
                order_regions_qn[qn][i].xCoordinate=line_coordinates_qn[qn][i].x
                order_regions_qn[qn][i].yCoordinate=line_coordinates_qn[qn][i].y
                
            }
        }
        return order_regions_qn
    }

    //Próximas atividades
    //filtras o desenho das linhas pretas por quadrante e os das linhas vermelhas também
    //Posteriormente, se a linha se interceptar, usar o algoritmo a seguir:
    //https://bl.ocks.org/1wheel/464141fe9b940153e636 - interceptação de linhas

    renderScaleBar(){
        //Render Scale bar
        let xScalerBar = this.config.width*0.25
        let yScaleBar = this.config.height
        let kilometers = d3.geoScaleBar()
                    .left(.2)
                    .top(.72)
                    .distance(2000);
        let scaleBarKilometers = this.svg.append("g")
            .attr("transform", "translate(0, 40)");

        kilometers.extent([xScalerBar, yScaleBar]).projection(this.projection);
        scaleBarKilometers.call(kilometers);
    }
        
    

    render(data_mapa) {
        this.tranlatemapX=this.config.width/2
        this.tranlatemapY=this.config.height*0.4
        // Map and projection
        this.projection = d3.geoMercator()
                            .rotate([0,0])
                            .center(this.center_map)      // GPS of location to zoom on
                            .scale(this.scale)                       // This is like the zoom:https://bl.ocks.org/mbostock/3757119
                            //.scale(this.scale)                       // This is like the zoom
                            .translate([this.tranlatemapX,this.tranlatemapY ])
        this.path = d3.geoPath()
                    .projection(this.projection);

        
        this.renderScaleBar()
        
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
 
        this.svg.exit().remove();
    }

    //Centroide da regiao 1
    //a = [x1,y1]
    //Coordenada final da linecoordinate da região 1
    //b = [line_coordinatesx1, line_coordinatesy1]
    //Centroide da regiao 2
    //c = [x2,y2]
    //Coordenada final da linecoordinate da região 2
    //d = [line_coordinatesx2, line_coordinatesy2]
    
    //intersection between lines connect points [a, b] and [c, d]
    intersection(a, b, c, d){
        var det = (a.x - b.x)*(c.y - d.y) 
                - (a.y - b.y)*(c.x - d.x),
    
        l = a.x*b.y - a.y*b.x,
        m = c.x*d.y - c.y*d.x,
    
        ix = (l*(c.x - d.x) - m*(a.x - b.x))/det,
        iy = (l*(c.y - d.y) - m*(a.y - b.y))/det,
        i = {'x':ix, 'y':iy}
    
        i['isOverlap'] = (ix == a.x && iy == a.y) || (ix == b.x && iy == b.y)
    
        i['isIntersection'] = !(a.x < ix ^ ix < b.x) 
                        && !(c.x < ix ^ ix < d.x)
                        && !i.isOverlap
                        && det
    
        // if (isNaN(i.x)) debugger
    
        return i
    }

   simbolsRingMaps(regions_qn, attributes, data_final_structure){
        console.log("REGIAO",regions_qn[1][4])

        //var data = ["A", "B", "C", "D"] //atributtes
        

        for (let qn=0;qn < 4; qn++){

            for (let i=0; i< regions_qn[qn].length; i++) {
                let region = regions_qn[qn][i] // TESTE -- RJ
                let cx = region.xCoordinate 
                let cy = region.yCoordinate 
                let angle = -region.angle //- (Math.PI/2*180)
                console.log(region.region)
                console.log("----******------",data_final_structure[region.region].variables[0].variablecolor)
                let side = this.config.width*1.5/100
                let variableside = this.config.width*1.5/100*1.5
                console.log("*-*-*-*", region.region,angle,this.cx,this.cy)
                // Option 1: provide color names:
                //var myColor = d3.scaleOrdinal().domain(attributes)
                //.range(["gold", "blue", "green", "yellow"])
                this.svg.selectAll(".firstrow").data(attributes).enter().append("rect")
                                                .attr("x", function(d,i){return cx + i*variableside})
                                                .attr("y", cy)
                                                .attr('width', side)
                                                .attr('height', side).attr("transform","rotate("+angle+"," + cx + "," + cy + ")")
                                                .style("stroke", "black")
                                                .attr('stroke-width', 1)
                                                .attr("fill", function(d, j){return data_final_structure[region.region].variables[j].ColorScale}) //function(d, i){return myColor(d) })
            }
            
        }

                                        // .attr("transform",function(d,i){ 
                                        //     return "translate( 600, 600) " + "rotate(-35)"})
                                        
        //this.svg.selectAll(".firstrow").attr("rotate(" + angle + ")");
        //this.svg.append("group").attr("translate","rotate(" + angle + ")");

        // Option 2: use a palette:
        // Include <script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script> in your code!
        // var myColor = d3.scaleOrdinal().domain(data)
        // .range(d3.schemeSet3);
        // this.svg.selectAll(".firstrow").data(data).enter().append("circle").attr("cx", function(d,i){return 30 + i*60}).attr("cy", 150).attr("r", 19).attr("fill", function(d){return myColor(d) })

   }

    renderKeyRing(atributtes){
        let x = this.config.width*0.05
        let y = this.config.height*0.50
        let side = this.config.width*1.5/100
        let variableside = this.config.width*1.5/100*1.5

        var legend = this.svg.selectAll('.legend_key').data(atributtes)
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) { return 'translate(0,' + i * variableside + ')'; });

        legend.append('rect')
            .attr('x', x)
            .attr('y', y + 10)
            .attr('width', side)
            .attr('height', side)
            .style("stroke", "black")
            .attr("alignment-baseline","middle")
            .attr('stroke-width', 2)
            .attr('fill', "white");

        legend.append('text')
            .attr('x', x + side + 5)
            .attr('y', y)
            .attr('dy', '1.5em')
            .attr("alignment-baseline","middle")
            .style('text-anchor', 'start')
            .attr("font-weight", "bold")
            .style('font-size', '12px')
            .text(function(d) { return createNewTitle(d); });
        
        this.svg.append("line")
            .attr("x1", x + side/2)
            .attr("y1", y + 10)
            .attr("x2", x + side/2)
            .attr("y2", y - 20)
            .attr("stroke","black")
            .attr('stroke-width', 2)

        this.svg.append("circle")
            .attr("cx", x + side/2)
            .attr("cy", y - 20)
            .attr("r", 6)
            .attr("stroke","black")
            .attr('fill', "black")

        this.svg.append("text")
            .attr("x", x )             
            .attr("y", y - 35) 
            .style("font-size", "16px")
            .style('text-anchor', 'start') 
            .attr("font-weight", "bold")
            .text("Chaves de Anel");
    }
    
    renderMapLegend (dataMin, dataMax, dataMean, legends, atributtes) {
        let x = this.config.width*0.1
        let y = this.config.height*0.85
        let side = this.config.width*1.6/100
        
        //cores do ranges 
        //let nested = unique //[{'key':'Rio de Janeiro','color':'red'}, {'key':'SP','color':'black'},{'key':'MG','color':'blue'}]
 
        var k=0
        let flag = true
        for (let i=0;i < atributtes.length ; i++){
            let title = atributtes[i]
            
            let newTitle1 = title.split("-")[0]
            let newTitle2 = title.split("-")[1] 
    
            let title1 = newTitle1.replaceAll('_',' ')
            let title2 = "("+newTitle2.replaceAll('_',' ')+")"
            
                        
            if (i>=5 && flag){
                k=0
                y=y+side*8 
                flag = false
            }

            let aux_x = x + k*0.2*this.config.width

            this.svg.append("text")
            .attr("x", aux_x)             
            .attr("y", y-17) 
            .style("font-size", "12px")
            .style('text-anchor', 'start') 
            .attr("font-weight", "bold")
            .text(title1);

            this.svg.append("text")
            .attr("x", aux_x)             
            .attr("y", y) 
            .style("font-size", "12px")
            .style('text-anchor', 'start') 
            .attr("font-weight", "bold")
            .text(title2);

            //Cores dos intervalos
            //let nested = legends[title]

            let max_barH = this.config.width*0.07
            let h_bar_i = 1.7
            let min = dataMin[title]
            let max = dataMax[title]
            let mean = dataMean[title]

            let nested = [min] //legends[title]
            let aux = (max-min)/max_barH
            for(let j=1; j<max_barH-1; j++){
                nested.push(nested[j-1] + aux)
            }
            nested.push(max)

            let textlabel_min_max = [d3.min(nested),d3.max(nested)].reverse()
            let textlabel_mean = [mean]
            let mean_Scale = (max - mean)*max_barH/(max-min)


            let color = legends[title][4].color

            let fun_color_scale = this.calculateColorScale(max,min,color)

            var legend = this.svg.selectAll('.legend'+title).data(nested)
                .enter().append('g')
                .attr('class', 'legend')
                .attr('transform', function(d, k) { return 'translate(0,' + k * 1 + ')'; });
                //.attr('transform', function(d, k) { return 'translate(0,' + k * side + ')'; });
            
            k=k+1

            legend.append('rect')
                .attr('x', aux_x)
                .attr('y', y + 10)
                .attr('width', side)
                .attr('height', h_bar_i)
                .style("stroke", "black")
                .attr("alignment-baseline","middle")
                .attr('stroke-width', 0)
                .attr('fill', function(d) { return fun_color_scale(d);});

            //Borda da Barra
            let Label_and_border = this.svg.selectAll('.legend_border'+title).data(textlabel_min_max)
                .enter().append('g')
                .attr('class', 'legend_border')
                .attr('transform', function(d, k) { return 'translate(0,' + k * 1 + ')'; });
        
            Label_and_border.append('rect')
                .attr('x', aux_x)
                .attr('y', y + 10)
                .attr('width', side)
                .attr('height', max_barH)
                .attr('stroke-width', 1)
                .attr('stroke',"Black")
                .attr('fill', "none");
            Label_and_border.append('text')
                .attr('transform', function(d, i) { return 'translate(0,' + i * max_barH + ')'; })
                .attr('x', aux_x + side*1.2)
                .attr('y', y + 10)
                .attr('dy', '0.5em')
                .style('text-anchor', 'start')
                .attr("font-weight", "bold")
                .style('font-size', '11px')
                .text(function(d) {return d.toString()});
            Label_and_border.append('line')
                .attr('transform', function(d, i) { return 'translate(0,' + i * max_barH + ')'; })
                .attr("x1", aux_x + side)
                .attr("y1", y + 10)
                .attr("x2", aux_x + side*1.2)
                .attr("y2", y + 10)
                .attr("stroke","black")
                .attr('stroke-width', 2);

            //Text label mean
            //Borda da Barra
            let Label_and_border_mean = this.svg.selectAll('.legend_border_mean'+title).data(textlabel_mean)
                .enter().append('g')
                .attr('class', 'legend_border_mean')
            Label_and_border_mean.append('text')
                .attr('x', aux_x + side*1.2)
                .attr('y', y + 10 + mean_Scale)
                .attr('dy', '0.5em')
                .style('text-anchor', 'start')
                .attr("font-weight", "bold")
                .style('font-size', '11px')
                .text(function(d) {return d.toString()});

            Label_and_border_mean.append('line')
                .attr("x1", aux_x + side)
                .attr("y1", y + 10 + mean_Scale)
                .attr("x2", aux_x + side*1.2)
                .attr("y2", y + 10 + mean_Scale)
                .attr("stroke","black")
                .attr('stroke-width', 2);



            // legend.append('text')
            //     .attr('x', aux_x + side + 5)
            //     .attr('y', y)
            //     .attr('dy', '1.5em')
            //     .attr("alignment-baseline","middle")
            //     .style('text-anchor', 'start')
            //     .attr("font-weight", "bold")
            //     .style('font-size', '12px')
            //     .text(function(d) { return d.key; });
        }
    }

    calculateColorScale (Lim_inf,Lim_sup, current_color){
        let color_base = "#ffffff"
        let ColorScale = d3.scaleSequential()
        .domain([Lim_inf,Lim_sup]) //Domínio do dado (0 até o limite máximo de cada eixo)
        .interpolator(d3.interpolateRgb(color_base,current_color));    //Valor pixel,this.config.width/14 = 14,5.   [14,50] 
        //Quando range min = this.config.width/14, está dando erro na escala da legenda.
        return ColorScale;
    }
    


}