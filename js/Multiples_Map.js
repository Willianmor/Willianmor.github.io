import {Maps} from "./maps.js";


export class MultiplesMap {
    constructor(data, defaultConfsvg = {'div': 'MultiplesMap'}) {
        
        this.config = defaultConfsvg;
        this.svg = null;

        this.dimesional = null;
        
   
        this.count = data.count_attr;
        this.mydata = data;
        console.log("MultipleMaps",data) 
    }


    //Calcula o width e height para uma dimensão.
    calculateExtensionAndCreateDivs() {
        //Requisita a quantidade de variáveis/atributos
        let len = this.count

        //Teste de agora
        this.dimesional = 600

        //Antes
        //this.dimesional = 770

        console.log("TESTE", len)

        let extension = []

        if (len>2 && len<=3) {
            //this.dimesional = (this.dimesional*100)/150.5
            //calcular width e height  usando função
            extension = this.mydata.calculaExtentSVG(this.dimesional)

            let html_code = '<div class="row">'
            for (let i=0; i< len; i++){
                html_code += '<div id="map-' + 
                                this.mydata.attributes[i] + '" class="col-4">'+
                                '</div>'
                
            }
            html_code += '</div>'  // html_code = html_code + '</div>' 
            $('#' + this.config.div).html(html_code);
        }

        else if (len==4) {
            this.dimesional = (this.dimesional*100)/130.5
            //calcular width e height
            extension = this.mydata.calculaExtentSVG(this.dimesional)
            
            console.log("***************************", this.mydata.attributes)
            let html_code = ''
            let aux = len/2
            for (let i=0; i< aux; i++){
                html_code += '<div class="row justify-content-center">'+
                                    '<div id="map-' + this.mydata.attributes[i*aux] + '" class="col-6">'+
                                    '</div>'+
                                    '<div id="map-' + this.mydata.attributes[i*aux+1] + '" class="col-6">'+
                                    '</div>'+
                                '</div>'
                //let container = document.getElementById(this.config.div);
                
            }
            $('#' + this.config.div).html(html_code);

        }

        else if (len>4 && len<=6) {
            this.dimesional = (this.dimesional*100)/130.5
            //calcular width e height
            extension = this.mydata.calculaExtentSVG(this.dimesional)
            //similar ao de três -> com duas linhas
            console.log("****************************_ Entrou em variável 5 e 6")
            extension = this.mydata.calculaExtentSVG(this.dimesional)

            let html_code = ''
            let aux = 0
            for (let j =0; j<2;j++) {
                html_code += '<div class="row">'
                for (let i=0; i< 3; i++){ // 0,1,2  //3,4,5
                    if (aux ==  this.mydata.attributes.length){break}
                    html_code += '<div id="map-' + 
                                    this.mydata.attributes[aux] + '" class="col-4">'+
                                    '</div>'
                    aux += 1
                }
                html_code += '</div>' 
            }
            
            $('#' + this.config.div).html(html_code);

        }

        else if (len>6 && len<=8) {
            this.dimesional = (this.dimesional*100)/130.5
            //calcular width e height
            extension = this.mydata.calculaExtentSVG(this.dimesional)
            //similar ao de três -> com duas linhas
            console.log("****************************_ Entrou em variável 5 e 6")
            extension = this.mydata.calculaExtentSVG(this.dimesional)

            let html_code = ''
            let aux = 0
            for (let j =0; j<2;j++) {
                html_code += '<div class="row">'
                for (let i=0; i< 4; i++){ // 0,1,2  //3,4,5
                    if (aux ==  this.mydata.attributes.length){break}
                    html_code += '<div id="map-' + 
                                    this.mydata.attributes[aux] + '" class="col-3">'+
                                    '</div>'
                    aux += 1
                }
                html_code += '</div>' 
            }
            
            $('#' + this.config.div).html(html_code);
        }

        else if (len>8 && len<=10) {
            //Teste para mapa auxiliar
            this.dimesional = (this.dimesional*100)/160.5
            //Antigo
            //this.dimesional = (this.dimesional*100)/140.5
            //calcular width e height
            extension = this.mydata.calculaExtentSVG(this.dimesional)
            //similar ao de três -> com duas linhas
            console.log("****************************_ Entrou em variável 5 e 6")
            extension = this.mydata.calculaExtentSVG(this.dimesional)

            let html_code = ''
            let aux = 0
            for (let j =0; j<3;j++) {
                html_code += '<div class="row">'
                for (let i=0; i< 4; i++){ // 0,1,2,3  //4,5,6,7 //8,9
                    if (aux < this.mydata.attributes.length){
                        html_code += '<div id="map-' + 
                                        this.mydata.attributes[aux] + '" class="col-3">'+
                                        '</div>'
                    }
                    aux += 1
                }
                html_code += '</div>' 
            }
            
            $('#' + this.config.div).html(html_code);
        }
        else{
            console.log("Número de variáveis é inadequado")
            return null;
        }
        console.log("EXTENSAO",extension)

        return extension;
    }

    //Faz um for em maps e plota tudo no mesmo div
    renderMaps(extension, center_map) {

        for (let i=0; i< this.mydata.attributes.length; i++){
            // //Inserir informações dos atributos/variáveis
            let name_attribute = this.mydata.attributes[i]
            let confsvg_ = {
                div: '#map-' + name_attribute, 
                width: extension[0], 
                height: extension[1],
                top: 30, 
                left: 10, 
                bottom: 30, 
                right: 30
            };
            var mapa = new Maps(center_map,confsvg_)
            // //Carregar o mapa com variable
            mapa.render(this.mydata.data_mapa, this.mydata.final_structure, name_attribute)
            //mapa.renderMapLegend(this.mydata.legend_by_coropletMap,name_attribute)
            let min = this.mydata.MINVALUES[name_attribute]
            let max = this.mydata.MAXVALUES[name_attribute]
            let mean = this.mydata.MEANVALUES[name_attribute]
            let cor = this.mydata.legend_by_coropletMap[name_attribute][4].color
            mapa.renderMapLegend(min,max,mean,name_attribute,cor)
        }
    }
    

}