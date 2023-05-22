// backendURL = "http://127.0.0.1:8080";
backendURL = "";
const myFunction = async () => {
  var checkBox = document.getElementById("locationcheck");
  var text = document.getElementById("location");
  // console.log(text);

  if (checkBox.checked == true) {
    text.style.display = "none";
    text.removeAttribute("required");
    // text.required = false;
  } else {
    text.style.display = "block";
    text.setAttribute("required", "");
    // text.required = true;
  }
  // const request = await fetch("https://ipinfo.io/json?token=");
  // const jsonResponse = await request.json();
  // location_corr = jsonResponse.loc.split(",");
  // console.log(jsonResponse);
};

const onClickSearch = async () => {
  var block1 = document.getElementById("block1");
  block1.innerHTML = "";
  var block2 = document.getElementById("block2");
  block2.innerHTML = "";
  var block3 = document.getElementById("block3");
  block3.innerHTML = "";
  var block4 = document.getElementById("block4");
  block4.innerHTML = "";
  // var block5 = document.getElementById("block5");
  // block5.innerHTML = "";
  const form = document.getElementById("form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });
  const keyword = form.elements["keyword"].value;
  const category = form.elements["category"].value;
  var distance;
  if (form.elements["distance"].value) {
    distance = form.elements["distance"].value;
  } else {
    distance = 10;
  }
  if (!keyword){
    return;
  }
  
  var segmentId;
  if (category == "music") {
    segmentId = "KZFzniwnSyZfZ7v7nJ";
  } else if (category == "sports") {
    segmentId = "KZFzniwnSyZfZ7v7nE";
  } else if (category == "artsTheatre") {
    segmentId = "KZFzniwnSyZfZ7v7na";
  } else if (category == "film") {
    segmentId = "KZFzniwnSyZfZ7v7nn";
  } else if (category == "miscellaneous") {
    segmentId = "KZFzniwnSyZfZ7v7n1";
  }
  if (document.getElementById("locationcheck").checked) {
    const request = await fetch("https://ipinfo.io/json?token=");
    const jsonResponse = await request.json();
    var location_corr = jsonResponse.loc.split(",");
  } else {
    const location = form.elements["location"].value;
    // console.log(location);
    if (!location){
      return;
    }
    const request = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=`
    );
    const jsonResponse = await request.json();
    // console.log(jsonResponse);
    if (location && jsonResponse.status !== "OK") {
      var notfound = `<div class="notfound"><p>No Records Found</p></div>`;
      document.getElementById("block1").innerHTML = notfound;
      return;
    }
    var location_corr = [
      jsonResponse.results[0].geometry.location.lat,
      jsonResponse.results[0].geometry.location.lng,
    ];
  }
  // console.log(segmentId);
  await fetch(
    `${backendURL}/ticketmastersearch?keyword=${keyword}&segmentId=${segmentId}&lat=${location_corr[0]}&lng=${location_corr[1]}&radius=${distance}`
  )
    .then((response) => response.json())
    .then((json) => {
      // console.log(json);
      if (json.page.totalElements === 0) {
        var notfound = `<div class="notfound"><p>No Records Found</p></div>`;
        document.getElementById("block1").innerHTML = notfound;
        return;
      }

      let ele = `<tr>
                  <th style="width:8%" class="date">Date</th>
                  <th style="width:8%"  class="date">Icon</th>
                  <th style="width:61%" class="event" onclick="sortTable(2)">Event</th>
                  <th style="width:3%" class="genre" onclick="sortTable(3)">Genre</th>
                  <th style="width:20%" class="venue" onclick="sortTable(4)">Venue</th>
                </tr>`;
      var eve = json._embedded.events;
      // console.log(eve);
      eve.forEach((event) => {
        ele += `<tr>
        <td class="row">
          <p style="font-size:14px; margin:0px; color:black;">${
            event.dates.start.localDate
          }</p>
          ${
            event.dates.start.hasOwnProperty("localTime")
              ? `<p style="font-size:14px; margin:0px; color:black;">${event.dates.start.localTime}</p>`
              : ``
          }
        </td>
		<td class="rowimg"><img src=${
      event.images[0].url
    } style="width:56px; height:40px"</img></td>
        <td class="rowname"><a onclick="eventDetail('${
          event.id
        }')" class="eventname" style="cursor:pointer; " >${event.name}</a></td>
         ${
           event.hasOwnProperty("classifications")
             ? `<td class="rowimg" style="color:black;">${event.classifications[0].segment.name}</td>`
             : `<td class="rowimg" style="color:black;"></td>`
         }
		
        <td class="rowname" style="color:black;">${
          event._embedded.venues[0].name
        }</td>
		</tr>`;
      });
      var final = `<div id="container" class="container">
      <table id="eventresult" align="center" border="1" cellspacing="0" style="margin:0px; min-width: 100%; border-left: 0px solid; border-right: 0px solid;">
       ${ele}
      </table>
      </div>`;
      document.getElementById("block1").innerHTML = final;
    });
};

const eventDetail = async (id) => {
  var block3 = document.getElementById("block3");
  block3.innerHTML = "";
  var block4 = document.getElementById("block4");
  block4.innerHTML = "";
  var data;

  await fetch(`${backendURL}/ticketmastereventdetail?id=${id}`)
    .then((response) => response.json())
    .then((json) => {
      data = json;
      var getDate = "";
      if (json.hasOwnProperty("dates") && json.dates.hasOwnProperty("start")) {
        if (json.dates.start.localDate) {
          getDate += json.dates.start.localDate;
        }
        if (json.dates.start.localTime) {
          getDate += " " + json.dates.start.localTime;
        }
      }

      var artist_team = "";
      if (
        json.hasOwnProperty("_embedded") &&
        json._embedded.hasOwnProperty("attractions")
      ) {
        var artiststr = json._embedded.attractions;
        for (var i = 0; i < artiststr.length; ++i) {
          if (artiststr[i].hasOwnProperty("url")) {
            if (i !== 0) {
              artist_team += ` | <a href='${artiststr[i].url}' target="_blank" class="artist">${artiststr[i].name}</a>`;
            } else {
              artist_team += `<a href='${artiststr[i].url}' target="_blank" class="artist">${artiststr[i].name}</a>`;
            }
          } else {
            if (i !== 0) {
              artist_team += ` | <a style="pointer-events: none" class="artist">${artiststr[i].name}</a>`;
            } else {
              artist_team += `<a style="pointer-events: none" class="artist">${artiststr[i].name}</a>`;
            }
          }
        }
      }

      var getGenre = "";
      if (json.hasOwnProperty("classifications")) {
        var genrestr = json.classifications;
        if (
          genrestr[0].hasOwnProperty("segment") &&
          genrestr[0].segment.name &&
          genrestr[0].segment.name !== "Undefined"
        ) {
          getGenre += genrestr[0].segment.name + " ";
        }
        if (
          genrestr[0].hasOwnProperty("genre") &&
          genrestr[0].genre.name &&
          genrestr[0].genre.name !== "Undefined"
        ) {
          getGenre += " | " + " " + genrestr[0].genre.name + " ";
        }
        if (
          genrestr[0].hasOwnProperty("subGenre") &&
          genrestr[0].subGenre.name &&
          genrestr[0].subGenre.name !== "Undefined"
        ) {
          getGenre += " | " + " " + genrestr[0].subGenre.name + " ";
        }
        if (
          genrestr[0].hasOwnProperty("subType") &&
          genrestr[0].subType.name &&
          genrestr[0].subType.name !== "Undefined"
        ) {
          getGenre += " | " + " " + genrestr[0].subType.name;
        }
      }

      var color = [];
      var code = "";

      if (
        json.hasOwnProperty("dates") &&
        json.dates.hasOwnProperty("status") &&
        json.dates.status.hasOwnProperty("code")
      ) {
        if (json.dates.status.code === "onsale") {
          color = ["rgb(59,133,36)", "47px"];
          code = "On Sale";
        } else if (json.dates.status.code === "offsale") {
          color = ["rgb(210, 46, 32)", "48px"];
          code = "Off Sale";
        } else if (json.dates.status.code === "rescheduled") {
          color = ["rgb(222, 164, 57)", "77px"];
          code = "Rescheduled";
        } else if (json.dates.status.code === "postponed") {
          color = ["rgb(222, 164, 57)", "60px"];
          code = "Postponed";
        } else if (json.dates.status.code === "cancelled") {
          color = ["rgb(0, 0, 0)", "60px"];
          code = "Cancelled";
        }
      }
      // console.log(json)
      var pricerange;
      if (json.hasOwnProperty("priceRanges")) {
        if (
          json.priceRanges[0].hasOwnProperty("min") &&
          json.priceRanges[0].hasOwnProperty("max")
        ) {
          pricerange = `${json.priceRanges[0].min} - ${json.priceRanges[0].max}`;
        } else if (
          !json.priceRanges[0].hasOwnProperty("min") &&
          json.priceRanges[0].hasOwnProperty("max")
        ) {
          pricerange = `${json.priceRanges[0].max} - ${json.priceRanges[0].max}`;
        } else if (
          json.priceRanges[0].hasOwnProperty("min") &&
          !json.priceRanges[0].hasOwnProperty("max")
        ) {
          pricerange = `${json.priceRanges[0].min} - ${json.priceRanges[0].min}`;
        }
      }
      if (pricerange && json.hasOwnProperty("priceRanges")) {
        if (json.priceRanges[0].hasOwnProperty("currency")) {
          pricerange += ` ${json.priceRanges[0].currency}`;
        }
      }
      var ele = `
      <p class="detailp">${json.name}</p>
      <div class="detaildiv">
            <div style="width:40%">
            ${
              getDate &&
              `<div>
                  <p class="detailheading">Date</p>
                  <p class="detailsubheading">
                    ${getDate}
                  </p>
                </div>`
            }
            ${
              artist_team &&
              `<div>
                    <p class="detailheading">Artist/Team</p>
                    ${artist_team}
                </div>`
            }
            ${
              json._embedded.venues[0].name &&
              `<div>
                  <p class="detailheading">Venue</p>
                  <p class="detailsubheading">
                    ${json._embedded.venues[0].name}
                  </p>
                </div>`
            }
            ${
              getGenre &&
              `<div>
                    <p class="detailheading">Genres</p>
                    <p class="detailsubheading">
                    ${getGenre}
                    </p>
                </div>`
            }
            ${
              pricerange
                ? ` <div>
                  <p class="detailheading">Price Ranges</p>
                  <p class="detailsubheading">
                    ${pricerange}
                  </p>
                </div>`
                : ``
            }     
            ${
              json.hasOwnProperty("dates") &&
              json.dates.hasOwnProperty("status") &&
              json.dates.status.hasOwnProperty("code")
                ? `<div>
                    <p class="detailheading">Ticket Status</p>
                    <p style="background: ${color[0]};padding: 3px;width: ${color[1]};border-radius: 8px;" class="detailsubheading">${code}</p>
                </div>`
                : ``
            }
            ${
              json.hasOwnProperty("url")
                ? `<div>
                  <p class="detailheading">Buy Ticket At:</p>
                  <a target='_blank' class="artist" href='${json.url}'>Ticketmaster</a>
                </div>`
                : ``
            }
         </div> 
            ${
              json.hasOwnProperty("seatmap") &&
              json.seatmap.hasOwnProperty("staticUrl")
                ? `<div class="seatmapdiv"> 
                    <img style="height:52vh; width:34vw" src="${json.seatmap.staticUrl}"></img>
                </div>`
                : ``
            }
        </div>
      `;
      var final = `<div id="eventdetail" class="eventdetail">${ele}</div>`;
      document.getElementById("block2").innerHTML = final;
    });
  // console.log("fv", data._embedded.venues[0].name);
  var ele2 = `<p class="moredetailsp">Show Venue Details</p>
        <i href="#maplocation" class="down" onclick="mapLocation('${data._embedded.venues[0].name}')"></i>`;
  var finalmoredetails = `<div id='moredetails' class="moredetails">${ele2}</div>`;
  document.getElementById("block3").innerHTML = finalmoredetails;
  var target = document.querySelector("#eventdetail");
  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

const mapLocation = async (venue) => {
  var block3 = document.getElementById("block3");
  block3.innerHTML = "";
  await fetch(`${backendURL}/ticketmastervenuedetail?venue=${venue}`)
    .then((response) => response.json())
    .then((json) => {
      console.log(json._embedded.venues[0]);
      var openMapAdd;
      var getURI;
      if (
        json._embedded.venues[0].name &&
        json._embedded.venues[0].address &&
        json._embedded.venues[0].address.line1 &&
        json._embedded.venues[0].city &&
        json._embedded.venues[0].city.name && 
        json._embedded.venues[0].state && 
        json._embedded.venues[0].state.stateCode && 
        json._embedded.venues[0].postalCode
      ){
        openMapAdd = `${json._embedded.venues[0].name} ${json._embedded.venues[0].address.line1} ${json._embedded.venues[0].city.name} ${json._embedded.venues[0].state.stateCode} ${json._embedded.venues[0].postalCode}`;
        getURI = encodeURIComponent(openMapAdd);
      }
      //   var openMapAdd = `${json._embedded.venues[0].name} ${json._embedded.venues[0].address.line1} ${json._embedded.venues[0].city.name} ${json._embedded.venues[0].state.stateCode} ${json._embedded.venues[0].postalCode}`;
      // var getURI = encodeURIComponent(openMapAdd);
      // console.log(getURI);
      var ele = `<div class="mapdiv">
                    <p class="mapdivheading">${
                      json._embedded.venues[0].name
                    }</p>
                    ${
                      json._embedded.venues[0].hasOwnProperty("images") &&
                      json._embedded.venues[0].images[0].hasOwnProperty("url")
                        ? `<img style="width:15%" src="${json._embedded.venues[0].images[0].url}"></img>`
                        : ``
                    }
                </div>
                <div class="mapdiv2">
                <div style="flex: 1; display: flex; justify-content: flex-end;">
                    <div class="addressdiv">
                        <div class="addressdiv2">
                        ${
                          json._embedded.venues[0].hasOwnProperty("address")
                            ? `
                          <div>
                                <p class="address">Address:</p>
                            </div>
                            <div>
                            ${
                              json._embedded.venues[0].address.hasOwnProperty(
                                "line1"
                              )
                                ? `<p style="margin:0px;" class="addressfont">${json._embedded.venues[0].address.line1}</P>`
                                : ``
                            }<div style="display:flex">
                             ${
                               json._embedded.venues[0].hasOwnProperty(
                                 "city"
                               ) &&
                               json._embedded.venues[0].city.hasOwnProperty(
                                 "name"
                               )
                                 ? `<p style="margin:0px;" class="addressfont">${json._embedded.venues[0].city.name}, </p>`
                                 : ``
                             }
                            ${
                              json._embedded.venues[0].hasOwnProperty(
                                "state"
                              ) &&
                              json._embedded.venues[0].state.hasOwnProperty(
                                "stateCode"
                              )
                                ? `<p class="addressfont">${json._embedded.venues[0].state.stateCode}</P>`
                                : ``
                            }</div>
                            ${
                              json._embedded.venues[0].hasOwnProperty(
                                "postalCode"
                              )
                                ? `<p style="margin:0px;" class="addressfont">${json._embedded.venues[0].postalCode}</P>`
                                : ``
                            }   
                            </div>
                        `
                            : ``
                        }
                            
                        </div>
                        <div style="margin:24px; display:flex; justify-content:center">
                        ${
                          getURI
                            ? `<a class="mapcolor" style="font-family: "Lato", sans-serif;" target="_blank" href='https://www.google.com/maps/search/?api=1&query=${getURI}'>Open in Google Maps</a>`
                            : `<a class="mapcolor" style="pointer-events: none; font-family: "Lato", sans-serif;" target="_blank" href='https://www.google.com/maps/search/?api=1&query=${getURI}'>Open in Google Maps</a>`
                        }
                            
                        </div>
                    </div>
                    </div>
                        
                    <div class="vl"></div>
                    <div style="flex: 1; display: flex; justify-content: flex-end;">
                        <div style="flex:1; margin-top:12px">
                        ${
                          json._embedded.venues[0].hasOwnProperty("url")
                            ? ` <a class="mapcolor"  target="_blank" style="font-family: "Lato", sans-serif;" href='${json._embedded.venues[0].url}'>More events at this venue</a>`
                            : ` <a class="mapcolor" target="_blank" style="pointer-events: none" href='${json._embedded.venues[0].url}'>More events at this venue</a>`
                        }
                       
                    </div>
                    </div>
                    
                </div>`;
      var final = `<div id="maplocation" class="maplocation">${ele}</div>`;
      document.getElementById("block4").innerHTML = final;
    });
  var target = document.querySelector("#maplocation");
  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

const clearSeach = () => {
  var text = document.getElementById("location");
  text.style.display = "block";
  document.getElementById("form").reset();
  window.history.replaceState({}, document.title, "/" + "");
  var block1 = document.getElementById("block1");
  block1.innerHTML = "";
  var block2 = document.getElementById("block2");
  block2.innerHTML = "";
  var block3 = document.getElementById("block3");
  block3.innerHTML = "";
  var block4 = document.getElementById("block4");
  block4.innerHTML = "";

};


// Sort function on header cell of table is taken from https://www.w3schools.com/howto/howto_js_sort_table.asp.
// I have made some changes to the original code to get working on fetched events table
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("eventresult");
  switching = true;
  dir = "asc";

  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      if (n == 2) {
        x1 = x.querySelector("a");
        y1 = y.querySelector("a");
      } else {
        x1 = x;
        y1 = y;
      }

      if (dir == "asc" && x1 !== null && y1 !== null) {
        if (x1.innerHTML.toLowerCase() > y1.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc" && x1 !== null && y1 !== null) {
        if (x1.innerHTML.toLowerCase() < y1.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}
