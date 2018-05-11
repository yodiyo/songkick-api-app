// add custom menu to spreadsheet
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Songkick API Menu')
      .addItem('Get gig data', 'displayGigData')
      .addToUi();
}


// function to call Songkick api based on artist input

function callGigs(artist) {
  
  // Call the Songkick api for specific band
  var response = UrlFetchApp.fetch("http://api.songkick.com/api/3.0/search/artists.json?apikey=[YOUR OWN SONGKICK API KEY]&query=" + artist);
  var json = response.getContentText();
  var data = JSON.parse(json);
  
  // fetch artist id
  var artistId = data["resultsPage"]["results"]["artist"][0]["id"];
  
  // publish artist id and songkick artist link
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  sheet.setColumnWidth(5, 200);
  sheet.getRange('d1').setValue("Artist ID");
  sheet.getRange('d2').setValue(artistId);
  sheet.setColumnWidth(6, 200);
  sheet.getRange('e1').setValue("Artist on Songkick");
  sheet.getRange('e2').setValue("https://www.songkick.com/artists/" + artistId).setWrap(true);
  
  // get artist data
  var gigData = UrlFetchApp.fetch("http://api.songkick.com/api/3.0/artists/" + artistId + "/gigography.json?apikey=[YOUR OWN SONGKICK API KEY]");
  var gigJson = gigData.getContentText();
  
  //Logger.log(gigJson);
  
  return JSON.parse(gigJson); 

}

function displayGigData(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  // get artist value from sheet
  var artist = sheet.getRange(2,1).getValue();
  
  var gigs = callGigs(artist);
  
  var numberEntries = gigs["resultsPage"]["totalEntries"];
    
  var results = gigs["resultsPage"]["results"]["event"];
  //Logger.log(results);
  
  var output = [];
  var entries = [];
  
  // get values from each event
  results.forEach(function(elem,i) {    
    var gigName = elem["displayName"];
    var gigLocation = elem["location"]["city"];
    var gigDate = elem["start"]["date"];
    var gigBilling = elem["performance"][0]["billing"];
    var gigCountry = elem["venue"]["metroArea"]["country"]["displayName"];
    var gigVenue = elem["venue"]["displayName"];
    // Logger.log(gigName);
    // Logger.log(gigVenue);
    // Logger.log(gigLocation);
    
    output.push([gigName, gigLocation, gigDate, gigBilling, gigCountry, gigVenue]);
    entries.push[numberEntries];
    sheet.setRowHeight(i+15,65);
  });
  
  // adds an index number to the array
  output.forEach(function(elem,i) {
    elem.unshift(i + 1);
  });
  
  var len = output.length;
  // Logger.log(len);
  
  // clear any previous content
  sheet.getRange(5,1,500,7).clearContent();
  
  // paste in the values
  sheet.getRange(5,1,len,7).setValues(output); // gigName, gigLocation, gigDate, gigBilling, gigCountry, gigVenue 
  sheet.getRange('c2').setValue(numberEntries); // number of entries
  
  // word wrap cells
  sheet.getRange(5,1,2,3).setWrap(true);
  sheet.getRange(5,7,len,3).setWrap(true);
  
  // combine values to ease copy and paste
  var firstGig = results[0]["displayName"] + " " + results[0]["location"]["city"];
  
  // wider columns and headings
  sheet.setColumnWidth(7, 200);
  sheet.getRange('f1').setValue("First gig");
  sheet.getRange('f2').setValue(firstGig).setWrap(true);
}
