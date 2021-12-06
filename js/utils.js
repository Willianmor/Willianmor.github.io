
export let globalValues = {
    filtro_estado: null,
    filtro_date_ini: null,
    filtro_date_fin: null,
    class_quemadas: ['DESMATAMENTO_CR', 'DEGRADACAO', 'DESMATAMENTO_VEG', 'CS_DESORDENADO', 'CS_GEOMETRICO', 'MINERACAO', 'CICATRIZ_DE_QUEIMADA'],
    cor_desmatamento: ['#FF0000', '#006400', '#8B4513', '#FFA500', '#FFF68F', '#CD8162', '#FFFF00'],
    parseDate: d3.timeParse("%Y-%m-%d"),
    timeSeries: null,
    mapa: null,
    bar:null,
    pie: null,
}

export function getCoresDesmatamento() {
    return ['#FF0000', '#006400', '#8B4513', '#FFA500', '#FFF68F', '#CD8162', '#FFFF00'];
}

export function showMessage(elementStr, delay) {
    $( elementStr ).fadeIn( 300 ).delay( delay ).fadeOut( 400 );
}

export function fillOptionsSelect(idElement, dataGrups){
    let count = $('#' + idElement + ' option').length;
    
    if (count<=0) {
      // add the options to the Select
      d3.select('#' + idElement)
        .selectAll('myOptions-'+idElement)
        .data(dataGrups)
        .enter()
        .append('option')
        .text(d => d) // text showed in the menu
        .attr("value", d => d) // corresponding value returned by the button
    }
    
}

export function sortByDate(arr) {
    let parseDate = globalValues.parseDate;
    let sorter = (a, b) => {
       return new Date(parseDate(a.properties.date)).getTime() - new Date(parseDate(b.properties.date)).getTime();
    }
    arr.sort(sorter);
 };



