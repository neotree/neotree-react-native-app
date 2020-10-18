export default  function mapEhrValuesToNeotreeKeys(data = {}) {
const items= [];
 Object.keys(data).map(key=>{
  if(data[key]){
  if(data[key] instanceof Object){ 
      const newKey = `${key}Id`
      items.push({key:newKey,value:data[key].id,valueLabel:data[key].name,valueText:data[key].name})
    } else{
      items.push({key:key,value:data[key],valueLabel:data[key],valueText:data[key]})
    }

  }  
  }); 
  
  return items;
  
}
