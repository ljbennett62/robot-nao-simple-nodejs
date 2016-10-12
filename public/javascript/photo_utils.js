/*global $:false */ // Fixes "'$' is not defined." error caused by JSHint
var PhotoUtils = {};

var analysis_result_counter = 0

PhotoUtils.App = function() {

    function refreshPhotos() {

        // POST the question request to the Node.js REST service
        $.ajax({
            type: 'GET',
            url: '/photoInfo',
            success: function (res, msg) {
                if (res.length > 0) {
                    var photoJson = JSON.parse(res)
                    // Only refresh is new photo available
                    if (photoJson.photo_taken_time != -1 && "img_" + photoJson.photo_taken_time != $(".photo").attr('id')) {
                        $('#main_wrapper').empty()
                        // Clone the analysis template from the .jade file
                        var template = $("#analysis_template").clone()
                        template.attr("id", photoJson.photo_taken_time);
                        template.removeClass("hidden")
                        $('#main_wrapper').append(template)

                        // Clone the analysis template from the .jade file
                        updatePhotoHtml(photoJson, template)
                        updateFacesHtml(photoJson, template)
                        updateClassifierHtml(photoJson, template)
                        updatePokerHtml(photoJson, template)
                        updateSimilarImagesHtml(photoJson, template)
                    }
                } else {
                    $('#main_wrapper').empty()
                    $('#main_wrapper').append("<div class='no_photo'>No Photo Available</div>")
                }
            }
        });
    }

    function updatePhotoHtml(photoJson,template) {
        var img = template.find('.photo')
        img.attr("src", "photo/" + photoJson.photo_taken_time);
        img.attr("id", "img_" + photoJson.photo_taken_time); // used by showFacesRegion()
    }

    function getFacesDetected(facesResults) {
        var faces = null
        if (facesResults.images.length > 0 && facesResults.images[0].faces.length > 0) {
            faces = facesResults.images[0].faces
        }
        return faces
    }

    function updateFacesHtml(photoJson,analysisHtml) {

        var facesResults = photoJson.vr_results.detect_faces
        var faces = getFacesDetected(facesResults)
        if (faces) {
            var faceResults = analysisHtml.find('.face_results')
            faceResults.removeClass("hidden")

            var results = []
            for (var i in faces) {
                var face = faces[i]
                if (face.gender) {
                    result = {}
                    result.description = "Gender: "  + face.gender.gender
                    result.confidence = Number(face.gender.score).toFixed(2)
                    results.push(result)
                }
                if (face.age) {
                    result = {}
                    result.description = "Age: "  + face.age.min + "-" + face.age.max
                    result.confidence = Number(face.age.score).toFixed(2)
                    results.push(result)
                }
                if (face.identity) {
                    result = {}
                    result.description = face.identity.name
                    result.confidence = Number(face.identity.score).toFixed(2)
                    results.push(result)
                }
            }

            addAnalysisResults(faceResults,results);

            // Update image once loaded
            var imgId = "#img_" + photoJson.photo_taken_time
            $(imgId).load(function() {
                showFacesRegion(imgId,faces,analysisHtml)
            });
        }
    }

    // Show face selection on top of photo
    function showFacesRegion(imgId,faces,analysisHtml) {

        // Need to do this to get <img> that is unscaled so we can have the real/unscaled width
        //  Oddly HTML5's img.naturalWidth wasn't working for me
        $("<img/>") // Make in memory copy of image to avoid css issues
            .attr("src", $(imgId).attr("src"))
            .load(function() {
                // Now we have real and displayed width
                var imageReduction = $(imgId).width() / this.width

                for (var i in faces) {
                    var face = faces[i]
                    if (face.face_location) {
                        faceRegion = $('<div />', {"class": 'face_region'})
                        faceRegion.css('left', (face.face_location.left*imageReduction) + "px");
                        faceRegion.css('top', (face.face_location.top*imageReduction) + "px");
                        faceRegion.css('height', (face.face_location.height*imageReduction) + "px");
                        faceRegion.css('width', (face.face_location.width*imageReduction) + "px");
                        $(".photo_wrapper").append(faceRegion)
                    }
                }
            });
    }

    function getClassesDetected(classifyResults) {
        var classes = null
        if (classifyResults.images.length > 0 && classifyResults.images[0].classifiers.length > 0
            && classifyResults.images[0].classifiers[0].classes.length > 0) {
            classes = classifyResults.images[0].classifiers[0].classes
        }
        return classes
    }

    function updateClassifierHtml(photoJson,analysisHtml) {

        var classifyResults = photoJson.vr_results.classify
        var classes = getClassesDetected(classifyResults)
        if (classes) {
            var classifierResults = analysisHtml.find('.classifier_results')

            var results = []
            for (var i in classes) {
                result = {}
                result.description = classes[i].class
                result.confidence = Number(classes[i].score).toFixed(2)
                results.push(result)
            }
            addAnalysisResults(classifierResults, results);
        }
    }

    function updatePokerHtml(photoJson,analysisHtml) {
        var pokerResults = analysisHtml.find('.poker_results')

        // Mock results for now
        var results = []
        result = {}
        result.description = "Ace of Spades"
        result.confidence = 1.0
        results[0] = result
        result.description = "Queen of Hearts"
        result.confidence = 0.55
        results[1] = result

        addAnalysisResults(pokerResults,results)
    }

    function updateSimilarImagesHtml(photoJson,analysisHtml) {
        var similarImages = analysisHtml.find('.similar_images')
    }

    function addAnalysisResults(parent,results) {

        var div = $('<div>')
        parent.append(div);

        var counter = 0
        for (var i in results) {
            var resultHtml = getAnalysisResultHtml(results[i].description,results[i].confidence)
            div.append(resultHtml);
            counter+=1
            if (counter % 4 == 0 || counter == results.length) {
                $('<div>', { 'class': 'clearBoth' }).appendTo(div);
            }
        }
    }

    function getAnalysisResultHtml(description,confidence) {

        analysis_result_counter+=1
        var template = $("#analysis_result").clone()
        template.attr("id", "analysis_result_" + analysis_result_counter)
        template.removeClass("hidden")

        var description_div = template.find('#analysis_result_description')
        template.attr("id", "analysis_result_description_" + analysis_result_counter)
        description_div.html(description)
        var confidence_div = template.find('#analysis_result_confidence')
        template.attr("id", "analysis_result_confidence_" + analysis_result_counter)
        confidence_div.html(confidence)

        return template;
    }

    // Initialize the application
    var init = function() {

        $("#takePhotoButton").click(function(){
            $.ajax({
                type: 'GET',
                url: '/takePhoto',
                success: function (res, msg) {
                    // Do nothing for now
                },
                error: function (res, msg, err) {
                    alert("Error communicating with server");
                }
            });
        });

        refreshPhotos()
        window.setInterval(function(){
            refreshPhotos()
        }, 5000);

    };

    // Expose privileged methods
    return {
        init : init
    };
}(); // Don't delete the circle brackets...required!

PhotoUtils.App.init()
