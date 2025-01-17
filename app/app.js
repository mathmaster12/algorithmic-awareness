function getSearchResults(q, limit, start, sort, facet) {
	console.log(q);
	console.log(limit);
	console.log(start);
	console.log(sort);
	console.log(facet);
	var key = "AIzaSyAUnpG5xJm-07UmUrx_V1rGgUOBY5iZLvY"; 
	var id = "010001021870615082419:c11y2dyi94c"; 
	var url = "https://www.googleapis.com/customsearch/v1?key=" + key + "&cx=" + id + "&alt=json" + (sort == null ? "" : "&sort=" + sort) + "&num=" + limit + "&start=" + start + "&prettyprint=true&q=" + q + (facet == null ? "" : "&hq=" + facet);
	
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", displaySearchResults);
	xhr.open("GET", url);
	xhr.send();
}

function displaySearchResults() {
	var results = JSON.parse(this.responseText);
	
	// Clear existing results
	var ul = document.querySelector("ul.result");
	ul.innerHTML = "";
	
	// Show info about results
	var resultinfo = document.getElementById("result-info");
	resultinfo.innerHTML = "<strong>" + results.queries.request[0].searchTerms + "</strong> (About " + results.queries.request[0].totalResults + ")";
	
	// Show current search category (facet)
	var sortcategory = document.getElementById("sort-category");
	if ("hq" in results.queries.request[0]) {
		sortcategory.innerHTML = "Category: " + results.queries.request[0].hq;
	}
	
	// Build the results links
	for (var result in results.items) {
		var item = document.createElement("li");
		item.innerHTML = "<a href='" + results.items[result]["link"] + "'>" + results.items[result]["htmlTitle"] + "</a><br />" + results.items[result]["htmlFormattedUrl"];
		ul.appendChild(item);
	}
	
	// Clear existing pagination
	var pagination = document.querySelector("ul.pages");
	pagination.innerHTML = "";
	
	// Create back/forward buttons
	function paginate(pageRef, text, className) {
		if (typeof pageRef !== "undefined") {
			var page = document.createElement("li");
			var link = document.createElement("a");
			link.classList.add(className);
			link.href = "#";
			link.addEventListener("click", function(e) {
				e.preventDefault();
				getSearchResults(pageRef[0].searchTerms, 10, pageRef[0].startIndex, null, pageRef[0].hq);
			});
			link.innerText = text;
			page.appendChild(link);
			pagination.appendChild(page);
		}
	}
	
	paginate(results.queries.previousPage, "Previous", "previous");
	paginate(results.queries.nextPage, "Next", "next");
	
	var resultsdiv = document.querySelector(".results");
	if (ul.innerHTML == "") {
		resultsdiv.classList.remove("returned");
		resultsdiv.classList.add("none");
	} else {
		resultsdiv.classList.add("returned");
		resultsdiv.classList.remove("none");
	}
	
	// Show relevant facets
	console.log(results);
	var facets = document.getElementById("facets")
	// Clear existing facets
	facets.className = "flex-facet";
	
	// If you have results, make offers visible
        facets.classList.add("offer");

	if (detectNaturalLanguage(results.queries.request[0].searchTerms)) {
		facets.classList.add("naturallanguage");
	}
	
	if (parseInt(results.searchInformation.totalResults) > 30) {
		facets.classList.add("many");
	}

	if (parseInt(results.searchInformation.totalResults) <= 0) {
		facets.classList.add("none");
	} else {
		facets.classList.add("categories");
		
		// Create list of categories to narrow down the search
		var searchFacets = results.context.facets;
		var terms = document.querySelector(".facet-categories p.terms");
		terms.innerHTML = "";
		
		// The first "all" category
		var link = document.createElement("a");
		link.href = "#";
		link.addEventListener("click", function(e) {
			e.preventDefault();
			getSearchResults(results.queries.request[0].searchTerms, 10, 1, null, null);
		});
		link.innerText = "All";
		terms.appendChild(link);
		
		// Iterate over remaining categories
		for (var f in searchFacets) {
			var link = document.createElement("a");
			link.href = "#";
			(function(category){
				link.addEventListener("click", function(e) {
					e.preventDefault();
					getSearchResults(results.queries.request[0].searchTerms, 10, 1, null, category);
				});
			})(searchFacets[f][0].anchor);
			link.innerText = searchFacets[f][0].anchor;
			terms.appendChild(link);
		}
	}
}

function detectNaturalLanguage(q) {
	var cueWords = ["about", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "became", "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "by", "call", "can", "cannot", "cant", "could", "couldnt", "cry", "describe", "do", "either", "except", "few", "fill", "find", "found", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "how", "however", "hundred", "if", "in", "indeed", "interest", "into", "is", "keep", "might", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "never", "nevertheless", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own", "part", "per", "perhaps", "please", "put", "rather", "see", "seem", "seemed", "seeming", "seems", "should", "show", "side", "since", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "temp", "temperature", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "under", "until", "up", "upon", "us", "very", "time", "were", "weather", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves"];
	
	// Find if first word in query exists in the list of cue words
	return cueWords.includes(q.split(" ", 1)[0]);
}

function locationTopic() {
	var msg = document.getElementById("message");
        if (navigator.geolocation) {
          //show loading message
          msg.style.display = 'block';
          navigator.geolocation.getCurrentPosition(addScript);
          console.log('geolocation done');
          msg.style.display = 'none';
        } else {
          //error with geolocation
          alert('Error: Your browser doesn\'t support geolocation.');
        }
}

function addScript(position) {
          //set latitude and longitude values
          var lat = parseFloat(position.coords.latitude);
          var lon = parseFloat(position.coords.longitude);
          var jsonp = document.createElement('script'); 
          jsonp.type = 'text/javascript';
          jsonp.async = true;
          jsonp.src = "https://en.wikipedia.org/w/api.php?action=query&format=json&list=geosearch&gscoord="+lat+"%7C"+lon+"&gsradius=10000&gslimit=25&callback=showSubjects"
	  var script = document.getElementsByTagName('script')[0]; 
          script.parentNode.insertBefore(jsonp, script);        
}

function showSubjects(data) {
	//hide loading message
        //var container = document.getElementById("terms");
	var location = [];
	var container = document.querySelector(".facet-many p.terms");
	container.innerHTML = "";
        var markup = '<span>';
        //var url = "./index.html?&q=";
        var i = -1;
        var length = data.query.geosearch.length;
        while (++i < length) {          
            	var link = document.createElement("a");
		location[i] = data.query.geosearch[i].title;
		console.log(data.query.geosearch[i].title);
		console.log(location[i]);
		link.href = "#";
		(function(place){
			link.addEventListener("click", function(e) {
				e.preventDefault();
				getSearchResults(place, 10, 1, null, null);
				console.log(place);
			});
		})(location[i].anchor);
		link.innerText = data.query.geosearch[i].title;
		container.appendChild(link)
        }    
        //container.innerHTML = markup + '</span> ';
}  


function researchOffer() {
	var today = new Date();
	// Note: avoid date ranges that include the new year
	var ranges = [
		{
			start: [10, 1], // MM, DD
			end: [12, 18],
			message: 'It is that time of the year. The days are shorter and research papers are happening. Get started by <a href="http://ask.lib.montana.edu/ask">talking to a Librarian</a>.'
		},
		{
			start: [3, 1],
			end: [5, 18],
			message: 'It is that time of the year. Spring fever is almost here, but you have a research paper to write. Get started by <a href="http://ask.lib.montana.edu/ask">talking to a Librarian</a>.',
			annotation: "It's getting later in the spring semester, so since you might be needing help with research, we're giving you a link to talk with a librarian."
		},
		{
			start: [5, 18],
			end: [8, 31],
			message: "School may be out but it's never a bad time to come in to the library. Stop in to chat with your friendly librarians today.",
			annotation: "It's summer, and most students will be out for summer break, so we're not going to show suggestions about helping with research."
		}
	]
	
	offerElement = document.getElementById("research-offer");
	
	for (i in ranges) {
		startDate = new Date(today.getFullYear(), ranges[i].start[0] - 1, ranges[i].start[1]);
		endDate = new Date(today.getFullYear(), ranges[i].end[0] - 1, ranges[i].end[1]);
		if (startDate < today && today < endDate) {
			offerElement.innerHTML = ranges[i].message;
			annotate(offerElement, ranges[i].annotation);
		}
	}
}

function weatherOffer() {
	// lat = "49.246292";
	// lng = "-123.116226";
	var url = "https://api.weather.gov/gridpoints/TFX/95,56";
	var xhr = new XMLHttpRequest();
	xhr.addEventListener("load", function() {
		var results = JSON.parse(this.responseText);
		cloudCover = results.properties.skyCover.values[0].value;
		console.log(cloudCover)
		message = '<p>Here comes the sun, stop in for a cup of something cool. Check out the <a href="http://www.montana.edu/ufs/menus/brewed_awakening.php">"Brewed Awakening" hours and menu</a>.';
		if (cloudCover > 0.3) {
			message = 'It\'s cloudy and cold, stop in for a cup of something warm. Check out the <a href="http://www.montana.edu/ufs/menus/brewed_awakening.php">"Brewed Awakening" hours and menu</a>.';
		}
		offerElement = document.getElementById("weather-offer");
		offerElement.innerHTML = message;
	});
	xhr.open("GET", url);
	xhr.send();
}

function annotate(node, annotation) {
	node.classList.add("annotation");
	node.setAttribute("data-annotation", annotation);
	enableAnnotation(node);
}

function enableAnnotation(node) {
	node.addEventListener("click", function(e) {
		if(document.body.classList.contains("xray")) {
			alert(e.target.attributes["data-annotation"].value);
			e.preventDefault();
		}
	});
}

function addInitialAnnotations() {
	annotations = document.getElementsByClassName("annotation");
	
	for(i = 0; i < annotations.length; i++) {
		enableAnnotation(annotations[i]);
	}
}

document.querySelector("form").addEventListener("submit", function(e) {
	e.preventDefault();
	var q = document.getElementById("q").value;
	getSearchResults(q, 10, 1, null, null);
});

addInitialAnnotations();
locationTopic();
researchOffer();
weatherOffer();
