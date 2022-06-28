//Carregando a Classe Data
import {Data} from "./data.js";
import { RingMap } from "./Ring_Map.js";


var data_covid = new Data("./assets/dataset_covid_minerado_normalizado_18012022.csv","./assets/EstadosBR_IBGE_LLWGS84_1.geojson")
await data_covid.loadData()

let confsvg = {
    div: '#map', 
    width: 1000, 
    height: 1000, 
    top: 30, 
    left: 10, 
    bottom: 30, 
    right: 30
};

//Testando o centro do mapa
let center_map= data_covid.calculateCenterMaps()
//console.log("CENTRO DO MAPA",center_map1)

var mapa = new RingMap(center_map,confsvg, data_covid.attributes.length)

mapa.render(data_covid.data_mapa)
let maxlatlong = [data_covid.maxlat, data_covid.maxlong]
let regions_qn = mapa.render_x(maxlatlong, data_covid.data_mapa, data_covid.final_structure)
mapa.simbolsRingMaps(regions_qn, data_covid.attributes,data_covid.final_structure)


mapa.renderMapLegend(data_covid.MINVALUES, data_covid.MAXVALUES, data_covid.MEANVALUES, data_covid.legend_by_coropletMap,data_covid.attributes)
mapa.renderKeyRing(data_covid.attributes)


console.log(data_covid.filename)
console.log("Está dentro do main")

