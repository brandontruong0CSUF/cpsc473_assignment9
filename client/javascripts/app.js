var main = function(toDoObjects) {
    "use strict";
    console.log("SANITY CHECK");

    var socket = io();

    var toDos = toDoObjects.map(function(toDo) {
        // we'll just return the description
        // of this toDoObject
        return toDo.description;
    });

    socket.on("updateToDo", function(msg) {
        if ($("#myContent1").length) {
            var $newDescription = $("<li>").text(msg.description).hide();
            $("#myContent1").prepend($newDescription);
            $newDescription.slideDown("slow");
        } else if ($("#myContent2").length) {
            var $newDescription = $("<li>").text(msg.description).hide();
            $("#myContent2").append($newDescription);
            $newDescription.slideDown("slow");
        } else if ($("#myContent3").length) {
            msg.tags.forEach(function(tag) {
                var $tagSection = $("h3:contains(" + tag + ") + ul");
                if ($tagSection.length) {
                    var $tagItem = $("<li>").text(msg.description).hide();
                    $tagSection.append($tagItem);
                    $tagItem.slideDown("slow");
                } else {
                    // Some complicated code that adds the correct tag if it does not exist
                    $tagSection = $("<h3>").text(tag).hide();
                    $(".content").append($tagSection);
                    $tagSection.slideDown("slow");
                    $tagItem = $("<ul>").append($("<li>").text(msg.description)).hide();
                    $(".content").append($tagItem);
                    $tagItem.slideDown("slow");
                }
            });
        }
        $.getJSON("todos.json", function(newToDoObjects) {
            toDoObjects = newToDoObjects;
            toDos = toDoObjects.map(function(toDo) {
                return toDo.description;
            });
        });
    });

    $(".tabs a span").toArray().forEach(function(element) {
        var $element = $(element);

        // create a click handler for this element
        $element.on("click", function() {
            var $content,
                $input,
                $button,
                i;

            $(".tabs a span").removeClass("active");
            $element.addClass("active");
            $("main .content").empty();

            if ($element.parent().is(":nth-child(1)")) {
                $content = $("<ul id='myContent1'>");
                for (i = toDos.length - 1; i >= 0; i--) {
                    $content.append($("<li>").text(toDos[i]));
                }
            } else if ($element.parent().is(":nth-child(2)")) {
                $content = $("<ul id='myContent2'>");
                toDos.forEach(function(todo) {
                    $content.append($("<li>").text(todo));
                });
            } else if ($element.parent().is(":nth-child(3)")) {
                var tags = [];

                toDoObjects.forEach(function(toDo) {
                    toDo.tags.forEach(function(tag) {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });
                console.log(tags);

                var tagObjects = tags.map(function(tag) {
                    var toDosWithTag = [];

                    toDoObjects.forEach(function(toDo) {
                        if (toDo.tags.indexOf(tag) !== -1) {
                            toDosWithTag.push(toDo.description);
                        }
                    });

                    return {
                        "name": tag,
                        "toDos": toDosWithTag
                    };
                });

                console.log(tagObjects);

                var $tagsContainer = $("<div id='myContent3'>");
                $("main .content").append($tagsContainer);
                tagObjects.forEach(function(tag) {
                    var $tagName = $("<h3>").text(tag.name),
                        $content = $("<ul>");


                    tag.toDos.forEach(function(description) {
                        var $li = $("<li>").text(description);
                        $content.append($li);
                    });

                    $tagsContainer.append($tagName);
                    $tagsContainer.append($content);
                });
            } else if ($element.parent().is(":nth-child(4)")) {
                var $input = $("<input>").addClass("description"),
                    $inputLabel = $("<p>").text("Description: "),
                    $tagInput = $("<input>").addClass("tags"),
                    $tagLabel = $("<p>").text("Tags: "),
                    $button = $("<span>").text("+");

                $button.on("click", function() {
                    var description = $input.val(),
                        tags = $tagInput.val().split(","),
                        newToDo = {
                            "description": description,
                            "tags": tags
                        };

                    $.post("todos", newToDo, function(result) {
                        // Send message to socket
                        socket.emit("updateToDo", newToDo);

                        //toDoObjects.push(newToDo);
                        toDoObjects = result;

                        // update toDos
                        toDos = toDoObjects.map(function(toDo) {
                            return toDo.description;
                        });

                        $input.val("");
                        $tagInput.val("");
                    });
                });

                $content = $("<div>").append($inputLabel)
                    .append($input)
                    .append($tagLabel)
                    .append($tagInput)
                    .append($button);
            }

            $("main .content").append($content);

            return false;
        });
    });

    $(".tabs a:first-child span").trigger("click");
};

$(document).ready(function() {
    $.getJSON("todos.json", function(toDoObjects) {
        main(toDoObjects);
    });
});