//Carregando a Classe Data
import {Data} from "./data.js";
import {Maps} from "./maps.js";
import { MultiplesMap } from "./Multiples_Map.js";
//import { RadarChart } from "./Radar_Chart.js";
import { RadarMap } from "./Radar_MapSZero.js";


var data_covid = new Data("./assets/dataset_covid_minerado_normalizado_18012022.csv","./assets/EstadosBR_IBGE_LLWGS84_1.geojson")
await data_covid.loadData()


let confsvg2 = {
    div: '#RadarMap', 
    width: 900, 
    height: 900, 
    top: 30, 
    left: 10, 
    bottom: 30, 
    right: 30,
    title: "Radar Map - Covid"
};


//Testando o centro do mapa
let center_map1 = data_covid.calculateCenterMaps()
//console.log("CENTRO DO MAPA",center_map1)


//Variável 1
//Criar os dados necessários do SVG
let center_map = center_map1 //[-55.79779400006231, -13.6]

// Radar Map
//let name_attribute1 = data_covid.attributes[1]
var mapa2 = new RadarMap(center_map,confsvg2)
mapa2.render(data_covid.data_mapa, data_covid.final_structure, data_covid.MAXVALUES,data_covid.MINVALUES)
mapa2.renderMapLegend(data_covid.attributes,data_covid.MAXVALUES,data_covid.MINVALUES,data_covid.MEANVALUES, confsvg2.title)







