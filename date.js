module.exports.getDate=function (){
    var today = new Date();
    var currentDay = today.getDay();
    var day = "";
    
    const options={
      weekday:"long",
      day:"numeric",
      month:"long"
    };
    
    return  today.toLocaleDateString("en-US",options);
    
}
