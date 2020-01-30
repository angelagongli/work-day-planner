var now = moment();

$(".todays-date").text(now.format("dddd, MMMM Do"));

// create timeblocks
for (var i = 0; i < 9; i++) {
    var row = $("<div>");
    row.attr("class", "row");

    var hour = moment().startOf("day").add(i + 9, "h");
    var hourCol = $("<div>" + hour.format("hA") + "</div>");
    hourCol.attr("class", "col-3 col-sm-2 col-lg-1 hour");

    var eventCol = $("<div>");
    eventCol.attr("class", "col-6 col-sm-8 col-lg-10 events");
    var eventInput = $("<textarea>");
    eventInput.attr("form", "events");
    eventInput.attr("id", "eventInput" + hour.format("H"));
    eventCol.append(eventInput);

    // color-code past, present and future timeblocks
    if (hour.isBefore(now, "hour")) {
        eventInput.attr("class", "past");
    }
    else if (hour.isSame(now, "hour")) {
        eventInput.attr("class", "present");
        row.css("border", "solid 3px black");
        var sunImg = $("<i>");
        sunImg.attr("class","fas fa-sun");
        eventCol.append(sunImg);
    }
    else {
        eventInput.attr("class", "future");
    }

    var saveCol = $("<div>");
    saveCol.attr("class", "col-3 col-sm-2 col-lg-1 save");
    var eventForm = $("<form>");
    eventForm.attr("id", "events");
    var saveButton = $("<input>");
    saveButton.attr("class", "save-button");
    saveButton.attr("type", "submit");
    saveButton.attr("value", "Save");
    saveButton.attr("data-hour", hour.format("H"));
    eventForm.append(saveButton);
    saveCol.append(eventForm);

    row.append(hourCol, eventCol, saveCol);
    $(".main-content").append(row);
}

var events = {
    hours: [],
    items: [],
    timestamp: 0,
}

function renderEvents (hour) {
    var savedEvents = JSON.parse(localStorage.getItem("events"));

    if (savedEvents !== null) {
        // saved events should not persist after  the planned day
        if (savedEvents.timestamp < moment().startOf("day").unix()) {
            localStorage.removeItem("events");
            return null;
        }
        
        events.hours = savedEvents.hours;
        events.items = savedEvents.items;
        for (var i = 0; i < events.hours.length; i++) {
            $("#eventInput" + events.hours[i]).val(events.items[i]);
        }
    }
}

function saveHour (hour) {
    var hourItem = $("#eventInput" + hour).val();
    var existingIndex = events.hours.indexOf(hour);    
    
    if (hourItem !== ""){
        // user is adding new event(s)
        if (existingIndex === -1) {
            events.hours.push(hour);
            events.items.push(hourItem);
        }
        // user made no changes to existing event(s)
        else if (hourItem === events.items[existingIndex]) {
            return null;
        }
        // user is modifying existing event(s)
        else {
            events.items.splice(existingIndex, 1, hourItem);
        }
    }
    else {
        // user is clearing existing event(s)
        if (existingIndex !== -1) {
            events.hours.splice(existingIndex, 1);
            events.items.splice(existingIndex, 1);    

            // if clearing the last remaining item, clear local storage
            if (events.hours.length === 0) {
                localStorage.removeItem("events");
                return null;
            }
        }
        // otherwise user clicked save button for no reason
        else {
            return null;
        }
    }
    events.timestamp = moment().unix();

    localStorage.setItem("events", JSON.stringify(events));
}

$(".save-button").on("click", function(event) {
    event.preventDefault();
    var hour = $(this).attr("data-hour");
    saveHour(hour);
})

renderEvents();