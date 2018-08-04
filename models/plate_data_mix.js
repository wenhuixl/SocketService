module.exports = {
    plateDataMix : function (data) {
        let plateData = new Array();
        for(let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i].plateNumbers.length; j++) {
                let dataUnit = {
                    Plate: data[i].plateNumbers[j],
                    InDate: data[i].begintime,
                    OutDate: data[i].endtime
                };
                plateData.push(dataUnit);
            }
        }
        return plateData;
    }

};