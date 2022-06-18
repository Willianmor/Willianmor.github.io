let defaultConfsvg = {
    //div: '#RadarMap', 
    width: 180, 
    height: 180, 

    // parametros do circulo
    // let cx: width/2, 
    // cy: height/2, 
    // parametros dos textos
    // x: width/2 + width/60,
    // y: width/2,
    // Coordenada do inicio dos eixos (centro)
    // x1:width/2,
    // x2:width/2,

};


export class RadarChart {
    constructor(attributes, max_values,min_values, svg, centroids, confsvg = defaultConfsvg, is_legend=false) {
        // centroids: [x, y]  -- da region
        this.config = confsvg;
        this.is_legend = is_legend;
        this.svg = svg;
   
        this.data = null;
        this.max_value = -1 //max_value  NAO USADO
        this.max_values = max_values
        this.min_values = min_values
        //this.createCentroids(attributes)
        this.x = centroids[0]
        this.y = centroids[1]
        this.createAttributeStructure(attributes, is_legend)
        // console.log("------- RADARCHART;", this.attributes,this.name_attributes)
        //this.createSvg(null);
        this.radialScale = null;
                
    }

    //Calculando so valores do radar da legenda
    // let auxmax = Math.round(this.max_values[this.name_attributes[0]])
    // let auxmin = Math.round(this.min_values[this.name_attributes[0]])
    // let m2 = Math.round((auxmax-auxmin)*0.66)
    // let m3 = Math.round((auxmax-auxmin)*0.33)
    // //console.log("TESTEEEEEEEE",0,auxmin,m2,m3,auxmax)
    // let ticks = [0,auxmin,m2,m3,auxmax]
   

    //Necessário normalizar os valores.
    createAttributeStructure(input_attributes, is_legend){ //input: attributes -> List
        //Lista de dicionários -> Criando para plotar vários radares em uma mesmo Radar.
        this.attributes = [] // => [ {x1:valor1,x2:valor2,...}, {x1:valor1,x2:valor2,...}]
        this.name_attributes = []

        if (is_legend){ //Input_attributes é uma lista com os Nomes dos atributos
            //Lista de valores

            let ticks = [1,1,1]
            //let ticks = [0,1,1*0.7,1]
            //Se for normalizar os dados pela população
            for(let k=0; k<ticks.length ; k++){
                let att = {}
                for(let i=0; i<input_attributes.length ; i++){
                    let name = input_attributes[i]
                    var value = -1
                    if(k==0){//minimo
                        value =  Math.round(this.min_values[name])
                        //console.log("Entrou em minimo")
                    }else if (k>0 && k<ticks.length-1){
                        value = Math.round((this.max_values[name]+this.min_values[name])/2)//Math.round((this.max_values[name]-this.min_values[name])*ticks[k])
                        //console.log("Entrou em intermediário")
                    }else {//maximo
                        value =  Math.round(this.max_values[name]*ticks[k])
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
        }else{
            //Se for normalizar os dados pela população
            for(let k=0; k<input_attributes.length ; k++){
                let att = {}
                let att_var = input_attributes[k].variables
                for(let i=0; i<att_var.length ; i++){
                    let name = att_var[i].name
                    let value = att_var[i].value
                    att[name] = value
                    if (k==0){this.name_attributes.push(name)} 
                }
                this.attributes.push(att)
            }
            //console.log("*-*-*-*-*-*-*-",this.attributes)
        }
        //console.log("*-*-*-*-*-*-*-",this.attributes)
    }

    //SVG deve ser criado para plotar a legenda
    // createSvg(svg_mapa) {
    //     this.svg = d3.select(this.config.div).append("svg")
    //     .attr("width", this.config.width)
    //     .attr("height", this.config.height)
    //     .attr('class', 'card');
    // }

    
    //Criando os ângulos de cada eixos a ser plotado
    angleToCoordinate(angle, value, is_polygon=false, i=0){
        //console.log(angle, value)

        //Calcula o valor escalado usando a função.
        if (is_polygon){
            let radialScale = this.list_radial_scale[i]
            //console.log("Lista de máximos",this.list_radial_scale[i])
            var scale = radialScale(value)
        }else{
            var scale = this.radialScale(value)
        }
        
        //console.log("ESCALAAAAA",scale)

        //Calcula as coordenadas x e y a partir das escalas, angulos e considera o centro do SVG
        let x = Math.cos(angle) * scale;
        let y = Math.sin(angle) * scale;
           
        //This.x e Thix.y são dos valores dos centróides. x e y são calculados a partir do angulo que é calculado com o número de variáveis para construir o radar.
        return {"x": this.x + x, "y": this.y - y};
    }

    getPathCoordinates(data_point){
        let coordinates = [];
        for (var i = 0; i < this.name_attributes.length; i++){
            let ft_name = this.name_attributes[i];
            //Calcula angulo entre os eixos
            let angle = null
            angle = this.calculateAngle(this.name_attributes,i)
            //Calcula as coordenadas dos extremos de cada eixo
            coordinates.push(this.angleToCoordinate(angle, data_point[ft_name], true,i));
        }

        //Necessário calcular a coordenada que irá fechar a linha do polígono.
        let j = 0
        let ft_name = this.name_attributes[j];

        //Calcula angulo entre os eixos
        let angle = null
        angle = this.calculateAngle(this.name_attributes,i)
        //Calcula as coordenada de extremo para fechar a geometria
        coordinates.push(this.angleToCoordinate(angle, data_point[ft_name],true,0));
        return coordinates;
    }

    calculateAngle(list_attribute,i){
        let len_list_attribute = list_attribute.length
        let angle = (Math.PI / 2) + (2 * Math.PI * i / len_list_attribute);
        return angle;
    }

    calculateLinearScale (Lim_inf,Lim_sup){

        //Fonte:https://www.d3indepth.com/scales/
        //let linearScale = d3.scalePow() //y=mxk+c. The exponent k is set using. Como calcular o melhor parâmetro k para melhor visualização? 
        //.exponent(0.3)
        let linearScale = d3.scaleLinear()
        .domain([Lim_inf,Lim_sup]) //Domínio do dado (0 até o limite máximo de cada eixo)
        .range([0,this.config.width/4.2]);    //Valor pixel,this.config.width/14 = 14,5.   [14,50] 
        //Quando range min = this.config.width/14, está dando erro na escala da legenda.

        return linearScale;
    }

    clearTitle(title){
        //Elimina os _ ou - das strings do título
        if (title.search('_') ){
            var new_title = title.replace('_',' ')
        } else if (title.search('-')) {
            var new_title = title.replace('-',' ')
        }

        return new_title;
    }



    //Espaço de renderização
    render() {
        
        this.list_radial_scale = []
        //Criando os eixos dos do radar - só na legenda
        for (var k = 0; k < this.attributes.length; k++) {
            //console.log("attributes.length",this.attributes)
            for (var i = 0; i < this.name_attributes.length; i++) {
                //console.log("this.name_attributes.length",this.name_attributes)
                let name = this.name_attributes[i]
                let max_value_by_att = this.max_values[name]
                let min_value_by_att = this.min_values[name]
                
                //console.log(this.min_values)
                //let radialScale = this.calculateLinearScale(min_value_by_att,max_value_by_att)
                //OBS.: Para colocar o mínimo aqui sendo o mínimo do valor e não zero, teria que criar uma lista com o valores mínimos e aplicar lá em cima também.

                let radialScale = this.calculateLinearScale(min_value_by_att,max_value_by_att)
                //let radialScale = this.calculateLinearScale(0,max_value_by_att)
                if(k==0){this.list_radial_scale.push(radialScale)} // usado para Polygon
                this.radialScale = radialScale
                
                //console.log("VALOR MAXIMO",max_value_by_att)
        
                //Calcula os angulos dos eixos.
                let angle = null
                angle = this.calculateAngle(this.name_attributes,i)

                
                let line_coordinate=null
                //this.is_legend = true
                if (this.is_legend){
                    
                    line_coordinate = this.angleToCoordinate(angle,max_value_by_att); //limite superior das variáveis (domínio) - considerar o valor normalizado geral
                } else {
                    
                    let max_val = this.attributes[k][name]
                    //Vacinação covid e População estão plotando errado.
                    //console.log(name)
                    
                    line_coordinate = this.angleToCoordinate(angle, max_val);
                }
                //console.log("*-*-*-*-*-*-*-",line_coordinate)
                

                // draw axis line
                if (k==0){
                    this.svg.append("line")
                    .attr("x1", this.x)
                    .attr("y1", this.y)
                    //precisamos desenhar uma linha para cada variável do mapa.
                    .attr("x2", line_coordinate.x)
                    .attr("y2", line_coordinate.y)
                    .attr("stroke","black");
                }

                //draw axis label - Deixa na legenda
                if (this.is_legend && k==0){
                    let text_anchor = "start"
                    if (angle > Math.PI/2 && angle < 3*Math.PI/2){
                        text_anchor = "end"
                    }

                    //console.log("*-*-*-*-*-*", name, angle)
                    let label_coordinate = this.angleToCoordinate(angle, max_value_by_att + 0.5); 
                    this.svg.append("text")
                    .attr("x", label_coordinate.x)
                    .attr("y", label_coordinate.y)
                    .style('text-anchor', text_anchor)
                    .attr("alignment-baseline","middle")
                    .attr("font-weight", "bold")
                    .style('font-size', '9px')
                    .text(this.clearTitle(name));
                }

            }
        }
        // for (var k = 0; k < this.attributes.length; k++) {
        //     for (var i = 0; i < this.name_attributes.length; i++) {
        //         if(k==0){console.log("Lista de máximos",this.list_radial_scale)}
        //     }
        // }
        
              
        // TODO: POlygons
        for (var k = 0; k < this.attributes.length; k++) {

            let line = d3.line()
                .x(d => d.x)
                .y(d => d.y);

            let d = this.attributes[k];
            let coordinates = this.getPathCoordinates(d);
            

            //draw the path element
            this.svg.append("path")
            .datum(coordinates)
            .attr("d",line)
            .attr("stroke-width", 1)
            .attr("stroke", "black")
            .attr("fill", "gray")
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5);  
            
                       
        }    
        this.svg.exit().remove();
    }

    

    //Legenda- Calcular os valores intermediários que serão plotados (5 valores de cada eixo, iniciando em zero, passando pelo mínimo e ir crescendo)

}