//'use strict';
//'use strict';

//Importando a biblioteca que calcula o centróide
import {polylabel} from "./lib/polylabel.js";


export class Data {
    //Criando construtor da classe
    constructor(filename,filenamemaps){
        this.filename = filename;
        this.filenamemaps = filenamemaps;
        this.data = null;
        this.data_mapa = null;
        
        //Criar listas que serão utilizadas para estruturas os dados
        // Criando vazio e vamos preencher posteriormente por meio de uma função
        //Indices
        this.region= [];
        this.cod_region = [];

        //Quantidade de variáveis
        this.countvar = 0;

        //Variáveis/Atributos a considerar (lembrando, a partir terceira coluna(primeira e segunda são relativas aos indices))
        this.attr = [];

        //Criando as cores de cada variável
        this.color = [];

        this.num_classes = 5;

        this.coordinates = []
        this.centroide = []
        


        //Maximos
        this.maxlat = null;
        this.minlat = null;
        this.maxlong = null;
        this.minlong = null;
                        
    }

    //Método da Classe Data que carrega o dado - load Promise é o método que apoia no carregamento do dado. Só carrega a próxima função depois que carregar o dado completo.
    async loadData() {
        await this._loadDataPromise();
        console.log(this.data)
        console.log(this.data_mapa)
                
        this.createIndexAttributes();

        this.calculateCenterMaps();
        
        this.dataFinalStructure();
        this.getQuadrantes();
        //this.orderByQuadrante(2);
        //this.orderByGlobal();
    }
    
    async _loadDataPromise() {
        let [data,data_mapa] = await Promise.all([
            d3.csv(this.filename),
            d3.json(this.filenamemaps)
        ])
        this.data = data;
        this.data_mapa = data_mapa;
    }


    //Construindo variáveis e índices
    createIndexAttributes(){

        //Obtém lista com as Strings de nomes dos atributos
        this.attributes = this.data.columns.slice(2)
        //console.log("Atributos",this.attributes)

        //Criar o valor máximo e mínimo de cada atributo
        
        this.MAXVALUES = {}
        this.MEANVALUES = {}
        this.MINVALUES = {}
        for (let i=0; i< this.attributes.length; i++) {
            let nameatt = this.attributes[i]
            this.MAXVALUES[nameatt] = -1
            this.MEANVALUES[nameatt] = 0
            this.MINVALUES[nameatt] = Number.POSITIVE_INFINITY
        }
        // this.MINVALUES = {}
        // for (let i=0; i< this.attributes.length; i++) {
        //     let nameatt = this.attributes[i]
        //     this.MINVALUES[nameatt] = Number.POSITIVE_INFINITY
        // }
        //console.log(this.MINVALUES,this.MAXVALUES)

        //Criação dos valores mínimos e máximos para cada atributo
        this.findMinMaxValues(this.data)

        //Necessário criar o valor mínimo

        //Computa a quantidade de atributos
        this.count_attr =  this.attributes.length
        //console.log(this.count_attr)

        if (this.count_attr == 3){         
            this.color = ["#FF0000","#008000","#0000FF"]
            //console.log("Três varáveis é possível")
        }else{
            //Criar as cores automaticamente para até 10  variáveis dos atributos calculados
            //this.color = d3.schemeCategory10.slice(0,this.count_attr)
            this.color = ["#0000FF","#FF7F00","#008000","#FF0000","#993399","#000000","#FFFF00","#50301E","#FF007F","#696969"]
            //console.log("Tem mais de três cores")
        }


                
        
        //Cria os tons de cor
        //O fillTonsColor retorna um objeto de tons de cores para cada cor corrente (variável)
        this.tons_color = this.fillTonsColor()

        //Atribuindo o nome das regiões e código das regiões
        let name_region = this.data.columns[0]
        let name_cod_region = this.data.columns[1]

        //Cria o objeto final do dado.
        this.variable_structure = {}
        //Iteração no dado (todas as variáveis) para empilhar as listas contidas no objeto e inserir no objeto por região.
        for (let i=0; i< this.data.length; i++) {
            let region = this.data[i][name_region]
            //Empilhando as strings e valores os índices de regiões
            this.region.push(region)
            this.cod_region.push(this.data[i][name_cod_region])

            //variable_structure[this.data[i][name_region]] = {}
            let res = this.dataVariablesbyRegion(this.data[i])
            this.variable_structure[region] = res
            console.log(region,  res)
        }
        //console.log(this.region)
        //console.log(this.cod_region)
        //console.log("-------MAXVALUES ------------",this.MAXVALUES)
        //console.log("-------MINVALUES ------------",this.MINVALUES)
      
    }

    findMinMaxValues(data) {
        //Realizando a iteração para preeencher os dados
        for(let i=0; i<this.attributes.length; i++) {

            let name_atribute = this.attributes[i]
            let tmp_sum = 0

            for(let j=0; j<data.length; j++) {
                let value_data = parseInt(this.data[j][name_atribute])
                tmp_sum += value_data
                //Avaliando o valor máximo
                if (this.MAXVALUES[name_atribute]<value_data) {
                    this.MAXVALUES[name_atribute] = value_data
                }

                //Avaliando o valor mínimo
                if (this.MINVALUES[name_atribute]>value_data) {
                    this.MINVALUES[name_atribute] = value_data
                }

            }
            this.MEANVALUES[name_atribute] = parseInt(tmp_sum/data.length)
        }
        console.log("-=-=-=-=-=-= ",this.MINVALUES,this.MAXVALUES )
    }

    //Função que cria as variáveis por região.
    dataVariablesbyRegion(data_region) {
        //let mydata = this.data
        //Criando a lista da estrutura das variáveis
        let list_variable_structure = []
        
        
        //Criando o objeto as informações da legenda
        let legend_by_coropletMap = {}
        let legend_by_value = {}

        //Realizando a iteração para preeencher os dados
        for(let i=0; i<this.attributes.length; i++) {

            let name_atribute = this.attributes[i]

            
            //Criando a variável com os valores de cores
            let color_atribute = this.color[i]
            //Criando a lista com os valores das classificações de cada variável
            let classify_atribute = this.classifyAttributes(name_atribute, data_region[name_atribute])


            //Calculando valor médio
            let average_atribute = this.calculaAverageValueAtribute(name_atribute, data_region[name_atribute])

            console.log(average_atribute)
            
            //Legenda do mapa de classes
            legend_by_coropletMap[name_atribute] = []
            let rangeclasses = classify_atribute[2]
            for(let j=0; j<rangeclasses.length; j++){
                let my_ton_color = this.tons_color[color_atribute][j]
                legend_by_coropletMap[name_atribute].push({'key':rangeclasses[j], 'color':my_ton_color})
            }

            //Informações para interpolação de cor
            let min = this.MINVALUES[name_atribute]
            let max = this.MAXVALUES[name_atribute]
            //console.log("Minimo,Maximo",min,max)


            //let auxColor = color_atribute
            let auxColor = d3.rgb(color_atribute).darker(1.0).formatHex()
            let fun_color_scale = this.calculateColorScale(min,max,auxColor)

            //Legenda
            //legend_by_value[name_atribute] = []
            //legend_by_value[name_atribute]= ({'key':data_region[name_atribute], 'color':fun_color_scale(parseInt(data_region[name_atribute]))})
            

            //Estrutura principal
            let variable_structure = {
                "name": name_atribute,
                "value": data_region[name_atribute],
                "variablecolor": color_atribute,
                "ColorScale": fun_color_scale(parseInt(data_region[name_atribute])),
                "rangeclasse": classify_atribute[1], 
                "variableclassify": classify_atribute[0],
                "colorranger_classify": this.tons_color[color_atribute][classify_atribute[0]-1]
            }
            //Empilhando as variáveis na lista da estrutura
            list_variable_structure.push(variable_structure)

        }

        //Atribuindo o objeto da legenda a uma variável do contexto.
        this.legend_by_coropletMap = legend_by_coropletMap
        
        return list_variable_structure
    }

    calculateColorScale (Lim_inf,Lim_sup, current_color){
        let color_base = "#ffffff"
        
        let ColorScale = d3.scaleSequential()
        .domain([Lim_inf,Lim_sup]) //Domínio do dado (0 até o limite máximo de cada eixo)
        .interpolator(d3.interpolateRgb(color_base,current_color));    //Valor pixel,this.config.width/14 = 14,5.   [14,50] 
        //Quando range min = this.config.width/14, está dando erro na escala da legenda.


        return ColorScale;
    }

    //Método de classificação dos índices para o mapa
    //Existe um parâmetro de entrada que é uma lista com os nomes dos atributos considerados do dataset
    calculaAverageValueAtribute(name_atribute, valor_attribute){

        //Declarando uma lista de atributos vazia - Essa lista considerá todas as regiçõ
        let list_atribute = []
        
        //Percorre o dataset e cria a lista de atributos # TODO: melhorar performance
        for (let i=0; i< this.data.length; i++) {
            list_atribute.push(this.data[i][name_atribute])
        }
        
        let averageAtribute = 0

        return averageAtribute  
    }



    //Método de classificação dos índices para o mapa
    //Existe um parâmetro de entrada que é uma lista com os nomes dos atributos considerados do dataset
    classifyAttributes(name_atribute, valor_attribute){

        //Declarando uma lista de atributos vazia - Essa lista considerá todas as regiçõ
        let list_atribute = []
        
        //Percorre o dataset e cria a lista de atributos # TODO: melhorar performance
        for (let i=0; i< this.data.length; i++) {
            list_atribute.push(this.data[i][name_atribute])
        }
        
        
        

        //Cria o novo objeto com a lista de atributos
        let serie6 = new geostats(list_atribute);
        //Roda o algoritmo que cria o grupo dentro de uma variável
        serie6.getClassJenks(this.num_classes);
        //Cria o range
        let ranges = serie6.getRanges();

        
        //Se tiver algum erro, o classificador será menos 1
        let classify = -1;
        
        //conhecer a classe
        for (let j=0; j < ranges.length ; j++){
            //Como o ranges é uma string, é necessário extrair os valores máximos e mínimos de cada range para classificar os valores das variáveis de cada índice
            let intervale = ranges[j].split(" - ");
            let min = parseFloat(intervale[0]);
            let max = parseFloat(intervale[1]);
            //Avalia os máximos e mínimos
            if (valor_attribute>=min && valor_attribute<max){
                classify = j+1  // class begin with "1"
                break;
            }
        }
        if (classify==-1){
            //console.log("WARNING: classify -1,",name_atribute, valor_attribute)
            classify = ranges.length
        }

        //console.log("**-*-*",name_atribute, ranges)
     
        return [classify, ranges[classify-1], ranges]
    }

    createSpecialTonsColor(){
        
        //Criando um objeto que irá receber os tons
        let tons_color = {}

        //Cor base (branco)
        let color_base = "#ffffff"

        //Percorrendo as cores de todas as variáveis e criando uma lista com os tons dessas cores para n variáveis (mapa coroplético)
        for(let i=0; i < this.color.length; i++){ // foreach (for i in color)
            //Criando a variável de cor corrente
            let current_color = this.color[i]
            //Interpolando as cores mais claras
            let color_interpolate = d3.interpolate(color_base,current_color) // [1, 63, 127, 191,255]
            //console.log("--------------",color_interpolate(1))
                      
            //Criando as listas de tons
            let list_tons = []
            var cor_rgb = ""
            //let list_tons_darker = []

            //Valores ímpares
            for (let j=0; j < this.num_classes; j++){
                let aux = j/this.num_classes//max_cor*(j/this.num_classes)
                list_tons.push(color_interpolate(aux))
                //console.log("DEBUG****************",color_interpolate[j],this.num_classes)
                // let aux = color_interpolate[j].toString()
                // if (i==0){cor_rgb = "rgb(" + aux  + ",0,0)"}
                // if (i==1){cor_rgb = "rgb(0," + aux  + ",0)"}
                // if (i==2){cor_rgb = "rgb(0,0," + aux  + ")"}
                // list_tons.push(cor_rgb)
            }
            console.log("CADEEEE*************************",list_tons)
            
            tons_color[current_color] = list_tons
        }
        return tons_color
    }

    createNormalTonsColor(){
        
        //Criando um objeto que irá receber os tons
        let tons_color = {}

        //Cor base (branco)
        let color_base = "#ffffff"

        //Percorrendo as cores de todas as variáveis e criando uma lista com os tons dessas cores para n variáveis (mapa coroplético)
        for(let i=0; i < this.color.length; i++){ // foreach (for i in color)
            //Criando a variável de cor corrente
            let current_color = this.color[i]
            //Interpolando as cores mais claras
            let color_interpolate = d3.interpolate(color_base,current_color)

            //Interpolando as cores mais escuras
            let darker = d3.rgb(this.color[i]).darker(1.0).formatHex()
            let color_interpolate_darker = d3.interpolate(current_color,darker)
            
            //Criando as listas de tons
            let list_tons = []
            let list_tons_darker = []

            //Valores ímpares
            for (let j=-1; j <= this.num_classes-1; j++){
                if(j%2!=0){ //impar : 1,3,5
                    //console.log("j:",j)
                    let aux = j/this.num_classes
                    list_tons.push(color_interpolate(aux))
                    //console.log(current_color,color_interpolate(aux))
                } 
            }

            //Valores pares
            for (let j=0; j <= this.num_classes; j++){
                if(j%5==0){ //0,5...
                    let aux = j/this.num_classes
                    list_tons_darker.push(color_interpolate_darker(aux))
                    //console.log(current_color,color_interpolate_darker(aux))
                }
            }
            //Armazenando todas as listas de tons no objeto de cada cor corrente.
            let metade = Math.ceil(this.num_classes/2.0)
            let complemento = this.num_classes - metade
            tons_color[current_color] = list_tons.concat(list_tons_darker.slice(-complemento))
        }
        return tons_color
    }


    


    //Cria os tons de cor
    fillTonsColor(){

        //Cor laranja - teste
        // for (let i=1; i < this.num_classes+1; i++){
        //     let aux = i/this.num_classes
        //     console.log(color_interpolate(aux))
        // }
        if (this.attributes.length == 3){
            return this.createSpecialTonsColor()
        }else{
            return this.createNormalTonsColor()
        }

        //Retorna o objeto tons de cores para cada cor corrente (variável)
        //return tons_color
    }
    
    getCentroide(dataset_mapa, precision=1.0){

        //Obtendo as coordenadas do GeoJson
        //console.log("lenght 27:",this.data_mapa.features.length)
        //console.log("geometry f[0]:",this.data_mapa.features[0].geometry)

        // for (let i=0; i< this.data_mapa.features.length; i++) {
        //     this.coordinates.push(this.data_mapa.features[i].geometry.coordinates[0])   
        // }
        

        // for (let i=0; i< this.data_mapa.features.length; i++) {
        //     let centroide = polylabel(this.data_mapa.features[i].geometry.coordinates[0],1.0); 
        //     console.log((centroide.slice(0,2)))
        //     //this.centroide.push(centroide) 
        // }
        let centroide = polylabel(dataset_mapa, precision);
        //console.log("MUDAR CENTROIDE",centroide)

        return centroide.slice(0,2)

    }

    calculateCenterMaps() {
        let centroides  = []
        let coordinates =[]
        let longCoordinates =[]
        let latCoordinates =[]
         
        //Obtem as coordenadas do mapa, para calculo do centro do mapa
        for (let i=0; i< this.data_mapa.features.length; i++) {
            coordinates.push(this.data_mapa.features[i].geometry.coordinates[0][0])

            //Calcula os cetróides dos estados
            let centroide = this.getCentroide(this.data_mapa.features[i].geometry.coordinates[0], 1.0)
            centroides.push(centroide)
        }

      
        for (let i=0; i< coordinates.length; i++) {
            for (let j=0; j< coordinates[i].length; j++) {
                longCoordinates.push(coordinates[i][j][0])
                latCoordinates.push(coordinates[i][j][1]) 
            }
        }
        
        //Criando as coordendas máximas e mínimas para o calculo do centróide
        var longCoordinatesmax = d3.max(longCoordinates)
        var longCoordinatesmin = d3.min(longCoordinates)
        //console.log(longCoordinatesmax,longCoordinatesmin)

        var latCoordinatesmax = d3.max(latCoordinates)
        var latCoordinatesmin = d3.min(latCoordinates)
        //console.log("-------------------------------",latCoordinatesmax,latCoordinatesmin)

 
        //Máximos e mínimos de longitude do dataset inteiro
        this.maxlong = longCoordinatesmax
        this.minlong = longCoordinatesmin

        this.maxlat = latCoordinatesmax
        this.minlat = latCoordinatesmin

        //centroide da regiao total (centro do mapa)
        this.meanmaxminlong = ((this.maxlong + this.minlong)/2)   //Alterar o centro do mapa
        this.meanmaxminlat = (this.maxlat + this.minlat)/2
     
        let centermap = [this.meanmaxminlong,this.meanmaxminlat]

        return centermap;     
    }




    




    //Calculando as dimensões da extensão
    calculaExtentSVG(dimensional) {
        let razao = 1
        let width = dimensional
        let height = dimensional


        //Calcular largura da região (em graus)-Delta LONG
        let deltalong = Math.sqrt(Math.pow(this.maxlong-this.minlong,2))
        //console.log("DIST LONGITUDE",this.maxlong, this.minlong,deltalong)

        //Calcular altura da região (em graus) - DElta LAT
        let deltalat = Math.sqrt(Math.pow(this.maxlat-this.minlat,2))
        //console.log("DIST LATITUDE",this.maxlat,this.minlat,deltalat)

        //Se x for maior que y
        if (deltalong>=deltalat) { 
            razao = deltalong/deltalat
            //console.log("RAZAO 1",razao)
            width = dimensional
            height = (width * 100 / (100+razao*10)) //Calculado em porcentagem para melhor entendimento
            //console.log(width,height)
        
        }else{  //Se y for maior que x
            razao = deltalat / deltalong
            height = dimensional
            width = (height * 100 / (100+razao*10))
            //console.log(width,height)
        }

        let extension = [width,height]
        
        return extension;
    }

    dataFinalStructure() {
        this.final_structure = {}

        for (let i=0; i< this.data_mapa.features.length; i++) {
            let region = this.data_mapa.features[i].properties.ESTADO

            this.final_structure[region] = {
                "centroide": this.getCentroide(this.data_mapa.features[i].geometry.coordinates[0], 1.0),
				"variables": this.variable_structure[region]  // TODO
            }
        }
        console.log("------------------------",this.final_structure)
        console.log(this.final_structure['PB'][this.centroide])
    }

    getQuadrantes(){    
        for (let i=0; i< this.data_mapa.features.length; i++) {
            let region = this.data_mapa.features[i].properties.ESTADO

            let cx = this.meanmaxminlong
            let cy = this.meanmaxminlat
        
            //obter o this.final_structure 
            var centroid = this.final_structure[region].centroide 
            // centroid[0] = longitude
            // centroid[1] =latitude

            let llong = centroid[0]
            let llat = centroid[1]
            
                    
            if (llat < this.maxlat && llat>=cy && llong<this.maxlong && llong>=cx){
                console.log("Primeiro Quadrante")
                this.final_structure[region]["Quadrante"] = 1
            }
            else if (llat>this.minlat && llat<=cy &&  llong<this.maxlong && llong>= cx){
                console.log("segundo Quadrante")
                this.final_structure[region]["Quadrante"] = 2

            }

            else if (llat>this.minlat && llat<=cy && llong>this.minlong && llong<=cx){
                console.log("terceiro Quadrante")
                this.final_structure[region]["Quadrante"] = 3

            }

            else if (llat < this.maxlat && llat>=cy && llong>this.minlong && llong<=cx){
                console.log("Quarto Quadrante")
                this.final_structure[region]["Quadrante"] = 4

            }

            else{
                console.log("ERRO")
                this.final_structure[region]["Quadrante"] = -1
            }

        } 
    
          
    }

    // orderByGlobal(){
    //     // output: ["RJ",..]
    //     //Coordenadas do centro da região Total
    //     let cx = this.meanmaxminlong
    //     let cy = this.meanmaxminlat

    //     let regions = []
    //     for (let i=0; i< this.data_mapa.features.length; i++) {
    //         let region = this.data_mapa.features[i].properties.ESTADO

    //         // //obter o this.final_structure 
    //         var centroid = this.final_structure[region].centroide 
    //         // centroid[0] = longitude
    //         // centroid[1] =latitude

    //         let llong = centroid[0]
    //         let llat = centroid[1]

    //         let dx = llong - cx
    //         let dy = llat - cy

    //         //Global Regions
    //         //regiones.push([region, llong, llat]) //(region, long, latt)
    //         regions.push({
    //             "region":region,
    //             "llong": llong,
    //             "llat": llat,
    //             "angle": Math.atan2(dy, dx) * 180 / Math.PI //angle in degrees
    //         })
            
    //     }
        
    //     regions.sort(function(a, b) {
    //         if (a.angle>b.angle){return -1} // if(a.llat>b.llat && a.llong < b.llong){return 1}) //menor
    //         else {return +1} //menor

    //     })
    //     console.log("SORT:", regions)

    // }

    // orderByQuadrante(nquadrante){
    //     // output: ["RJ",..]
    //     //Coordenadas do centro da região Total
    //     let cx = this.meanmaxminlong
    //     let cy = this.meanmaxminlat


    //     let regions = []
    //     for (let i=0; i< this.data_mapa.features.length; i++) {
    //         let region = this.data_mapa.features[i].properties.ESTADO

    //         // //obter o this.final_structure 
    //         var centroid = this.final_structure[region].centroide 
    //         // centroid[0] = longitude
    //         // centroid[1] =latitude

    //         let llong = centroid[0]
    //         let llat = centroid[1]


    //         //1 quadrante
    //         if (this.final_structure[region].Quadrante==nquadrante){
    //             //regiones.push([region, llong, llat]) //(region, long, latt)
    //             regions.push({
    //                 "region":region,
    //                 "llong": llong,
    //                 "llat": llat,
    //                 "angle":-1
    //             })
    //         }
            
    //     }

    //     // arr.sort(function(a, b) {
    //     //     var keyA = new Date(a.updated_at),
    //     //       keyB = new Date(b.updated_at);
    //     //     // Compare the 2 dates
    //     //     if (keyA < keyB) return -1;
    //     //     if (keyA > keyB) return 1;
    //     //     return 0;
    //     //   });

    //     // ordenar  
    //     if(nquadrante==1){ //Calcular os angulos usando geometria analítica

    //         for (var i=0;i<regions.length;i++){

    //             let dx = regions[i].llong - cx
    //             let dy = regions[i].llat - cy
    //             regions[i].angle = Math.atan2(dy, dx) * 180 / Math.PI; //angle in degrees

    //         }

    //         regions.sort(function(a, b) {
    //             if (a.angle>b.angle){return -1} // if(a.llat>b.llat && a.llong < b.llong){return 1}) //menor
    //             else {return +1} //menor

    //         })
    //     }
    //     console.log("SORT:", regions)

    //     if(nquadrante==2){

    //         for (var i=0;i<regions.length;i++){

    //             let dx = regions[i].llong - cx
    //             let dy = regions[i].llat - cy
    //             regions[i].angle = Math.atan2(dy, dx) * 180 / Math.PI; //angle in degrees

    //         }

    //         regions.sort(function(a, b) {
    //             if (a.angle>b.angle){return -1} // if(a.llat>b.llat && a.llong < b.llong){return 1}) //menor
    //             else {return +1} //menor

    //         })

    //     }
    //     console.log("SORT: 2quadrante", regions)

    //     //for(let i=0;i<regiones.length;i++){

    //         //1quadrante - Lat (maior) e long (maior)
            
            

    //         //2quadrante - Long (menor) e Lat (menor) 

    //         //3quadrante - Lat (menor) e Long (menor)

    //         //4quadrante - Long (menor) e Lat (maior)
    //     //}

    // }
    
   

}

 























// function data() {

//     var scope = this;
//     var exports = {};

//     var atributos = undefined;
      

//     //scope.fileCSV  = function(file, svg, cht) {
//     scope.fileCSV  = function(file) {        
//         d3.csv(file, function(error, data) {
//             if (error) throw error;        
//             console.log(data)
//             //console.log(data.columns)
            
//             atributos = data.columns
//             console.log(atributos.length)
//             console.log(atributos)

            
//             var atributos1 = data.columns[0].toString();
//             console.log(atributos1)
//             var atr = '"' + atributos1 + '"';
//             console.log(atr.toString())


//             var index = data.slice();
//             console.log(index)

//             data.forEach(d => {
//                 d.atr = +d.atr;
//                 d.Casos_Covid = +d.Casos_Covid;
//             });

//             console.log(data)

//             const nested = d3.nest()  
//                 .key(function(d) { return d.atr; })
//                 .entries(data);
//             console.log(nested);

//             //Função data.map cria um vetor com os valores da coluna de 
//             //var index  = (data.map(function(d) { return d.atributos1}));
//             //console.log(data);

//             //Para criar um vetor com um objeto.
//             //var datas = [];

//             // for(var id=0; id<atributos.length; id++)
//             // {
//             //     var atributosfinal = data.columns[id];
//             //     // var x = myApp.V1[id];
//             //     // var y = myApp.V2[id];
//             //     // var cor = myApp.V3[id];
//             //     // var r = 5;       
                                
//             //     //var c = {'atributos': atributosfinal};
//             //     //console.log(c);
//             //     datas.push(atributosfinal);
//             // }

//             // console.log(datas)
//             //return datas;

            
//             // var nested = d3.nest()
//             //     .key(function(d) { return d.origin; })
//             //     .entries(data);
            
//             // const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
//             //     .domain(nested.map(function(d) { return d.origin; }));
            
//             // scope.createAxes(svg, data);
//             // scope.addZoom(svg);
//             // scope.appendCircles(cht, data, colorScale);
            
//             // if (scope.allowLegend)         
//             //     scope.appendLegend(svg, nested, colorScale);

//             // scope.addBrush(cht, colorScale);
            
    
//         });

//     }

//           //------------- exported API -----------------------------------

//           exports.run = function(div, data) {
            
//             scope.div = div;
//             //scope.callback = callback;

//             // var svg = scope.appendSvg(div, data);
//             // var cht = scope.appendChartGroup(svg); 

//             // scope.fileCSV(data, svg, cht);
//             scope.fileCSV(data);
//         }

//         return exports;

// }