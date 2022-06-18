//Carregando a Classe Data
import {Data} from "./data.js";
import { MultiplesMap } from "./Multiples_Map.js";



var data_covid = new Data("./assets/dataset_covid_minerado_normalizado_18012022.csv","./assets/EstadosBR_IBGE_LLWGS84_1.geojson")
await data_covid.loadData()


//Variável 1
//Criar os dados necessários do SVG
let center_map = data_covid.calculateCenterMaps()


var multiplesmap = new MultiplesMap(data_covid)
//console.log("------- MultiplesMap;")

let extension = multiplesmap.calculateExtensionAndCreateDivs()
multiplesmap.renderMaps(extension, center_map)



