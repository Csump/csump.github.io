var notificationPalette = createNotificationPalette("Script started...");

var recordFilePath = "C:/Users/POR7BP/Documents/_PERSONAL/_ILLU SCRIPTS/receptstat.json";
var recordFile = new File(recordFilePath);

var doc = app.activeDocument;
var artboardsPerRow = 7;

var artboardWidthMM = 55;
var artboardHeightMM = 85;
var marginMM = 0;

var ingredients = ['meat', 'fruit', 'vegetable', 'milk', 'bread', 'stone', 'wine', 'coin'];
var errorImages = "";

// Save the original artboard size and position cause Illustrator is a piece of shit
var originalArtboard = doc.artboards[0];
var originalArtboardRect = originalArtboard.artboardRect.slice();

// JSON parser cause Illustrator is a piece of shit
function parseJSON(jsonString) {
    return eval('(' + jsonString + ')');
}

// Function to create or update a palette for notifications
function createNotificationPalette(message) {
    var palette = new Window("palette", "Notification");
    
    var text = palette.add("statictext", undefined, message);
    text.size = [300, 50];
    text.alignment = "center";

    palette.show();
    return palette;
}

// Function to find an object with a certain name
function findObject(group, name) {
    for (var l = 0; l < group.pageItems.length; l++) {
        if (group.pageItems[l].name === name) {
            return group.pageItems[l];
        }
    }
    return null;
}

// Function to check if an item is in an array
function arrayContains(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === item) {
            return true;
        }
    }
    return false;
}

// Function to calculate the sum of ingredient values
function calculateIngredientSum(record, ingredients) {
    var sum = 0;
    for (var key in record) {
        if (arrayContains(ingredients, key) && record.hasOwnProperty(key) && record[key] !== "") {
            var value = parseInt(record[key], 10);
            if (!isNaN(value)) {
                sum += value;
            }
        }
    }
    return sum;
}

// Process JSON
var records = [];
if (recordFile.open("r")) {
    var jsonData = recordFile.read();
    recordFile.close();

    records = parseJSON(jsonData);
}

// Define PPI
var ppi = 300;
doc.rasterEffectSettings.resolution = ppi;

// Convert millimeters to points
function millimetersToPoints(millimeters) {
    return millimeters * 2.834645669291339;
}

// Convert to points for Illustrator
var artboardWidth = millimetersToPoints(artboardWidthMM);
var artboardHeight = millimetersToPoints(artboardHeightMM);
var margin = millimetersToPoints(marginMM);

// Get or create the "Generated" layer
var generatedLayer;
try {
    generatedLayer = doc.layers.getByName("Generated");
} catch (e) {
    generatedLayer = doc.layers.add();
    generatedLayer.name = "Generated";
}

// Remove all items from the "Generated" layer
for (var i = generatedLayer.pageItems.length - 1; i >= 0; i--) {
    generatedLayer.pageItems[i].remove();
}

// Clear all artboards except the first one
while (doc.artboards.length > 1) {
    var lastIndex = doc.artboards.length - 1;
    doc.artboards.setActiveArtboardIndex(lastIndex);
    doc.artboards[lastIndex].remove();
}

// Get the "Original" layer
var originalLayer = doc.layers.getByName("Original");

// Copy contents from the "Original" layer
var itemsToCopy = [];
for (var i = 0; i < originalLayer.pageItems.length; i++) {
    itemsToCopy.push(originalLayer.pageItems[i]);
}

// Define swatches for each category based on names
var categorySwatches = {};
var swatches = doc.swatches;

// Get swatches and assign to categories
for (var i = 0; i < swatches.length; i++) {
    var swatch = swatches[i];
    switch (swatch.name) {
        case "Soup":
            categorySwatches["L"] = swatch;
            break;
        case "Main":
            categorySwatches["F"] = swatch;
            break;
        case "Dessert":
            categorySwatches["D"] = swatch;
            break;
    }
}

// Function to find swatch by name
function findSwatch(name) {
    for (var i = 0; i < swatches.length; i++) {
        var swatch = swatches[i];
        if (swatch.name === name) {
            return swatch
        }
    }
    return null;
}

// Check if swatches were assigned correctly
if (!categorySwatches["L"]) {
    alert("Swatch 'Soup' not found.");
    exit();
}
if (!categorySwatches["F"]) {
    alert("Swatch 'Main' not found.");
    exit();
}
if (!categorySwatches["D"]) {
    alert("Swatch 'Dessert' not found.");
    exit();
}

// Create new artboards and copy elements for each record
for (var i = 0; i < records.length; i++) {

    var row = Math.floor((i + 1) / artboardsPerRow);
    var column = (i + 1) % artboardsPerRow;

    // Calculate artboard position
    var left = column * (artboardWidth + margin);
    var top = -row * (artboardHeight + margin);
    var right = left + artboardWidth;
    var bottom = top - artboardHeight;

    // Create new artboard
    var artboard = doc.artboards.add([left, top, right, bottom]);
    doc.artboards.setActiveArtboardIndex(i + 1);
    
    var artboardBounds = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
    var artboardX = artboardBounds[0];
    var artboardY = artboardBounds[1];
    var duplicatedItems = [];

    var rec = records[i];
    var rec_name = rec.name;           // Kaja neve
    var rec_power = rec.power;         // Kaja képessége
    var rec_category = rec.category;   // Leves, Főétel, Desszert
    var rec_bonus_type = rec.bonus;    // Semmi, Szívatás, Kollab, Boost
    var rec_type = rec.type;           // Vegán, Gourmet, Falusi, Bó'ti
    var rec_points = rec.points;       // Kaja pontértéke
    
    artboard.name = rec_name;

    // Duplicate each item from the "Original" layer and place them on the "Generated" layer
    for (var j = 0; j < itemsToCopy.length; j++) {
        var originalItem = itemsToCopy[j];
        var newItem = originalItem.duplicate(generatedLayer);
        duplicatedItems.push(newItem);
    }

    // Group the duplicated items
    if (duplicatedItems.length > 0) {
        var newGroup = generatedLayer.groupItems.add();
        for (var k = 0; k < duplicatedItems.length; k++) {
            duplicatedItems[k].move(newGroup, ElementPlacement.PLACEATEND);
        }

        // Color Filter
        var colorFilter = findObject(newGroup, "Color Filter");
        if (colorFilter) {
            var swatchName = rec_category[0];
            if (categorySwatches[swatchName]) {
                colorFilter.fillColor = categorySwatches[swatchName].color;
            } else {
                alert("Swatch for category '" + swatchName + "' not found.");
                exit();
            }
        }

        // Name
        var foodName = findObject(newGroup, "Name");
        if (foodName) {
            foodName.contents = rec_name;
        }

        // Points
        var points = findObject(newGroup, "Point Value");
        if (points) {
            points.contents = rec_points;
        }

        // Type
        var type = findObject(newGroup, "Type");
        if (type) {
            type.contents = rec_type;
        }

        // Bonus
        var bonus = findObject(newGroup, "Bonus");
        if (bonus) {
            if (rec_power.length > 0) {
                bonus.contents = rec_power;
            } else {
                bonus.contents = "Nincs k\u00e9pess\u00e9ge.";
                bonus.opacity = 25;
            }
        }

        // Category Icon
        var category_char = rec_category[0];
        var iconSoup = findObject(newGroup, "Category_Soup");
        var iconMain = findObject(newGroup, "Category_Main");
        var iconDessert = findObject(newGroup, "Category_Dessert");

        if (iconSoup && iconMain && iconDessert) {
            iconSoup.hidden = true;
            iconMain.hidden = true;
            iconDessert.hidden = true;

            switch (category_char) {
                case "L":
                    iconSoup.hidden = false;
                    break;
                case "F":
                    iconMain.hidden = false;
                    break;
                case "D":
                    iconDessert.hidden = false;
                    break;
            }
        }

        // Ingredients
        var ingredientsGroup = findObject(newGroup, "Ingredientes");
        
        if (ingredientsGroup) {
            handleIngredients(ingredientsGroup, rec, ingredients);
        }

        // Power Types
        var powerTypeGroup = findObject(newGroup, "Power Type");
        
        if (powerTypeGroup) {
            pickPowerType(powerTypeGroup, rec_bonus_type);
        }

        // Images
        var rec_name_formatted = formatImageFileName(rec_name);
        var imagePath = 'C:/Users/POR7BP/Documents/_PERSONAL/_MOME/_KALI/Cards v3/Links/Recipes/' + rec_name_formatted;

        var fileRef = new File(imagePath);

        if (fileRef.exists) {
            var illustrationGroup = findObject(newGroup, "Illustration");
            if (illustrationGroup) {
                var image = findObject(illustrationGroup, "Image");

                if (image) {
                    image.file = fileRef;
                } else {
                    alert("Image object not found in the Illustration group.");
                }
            } else {
                alert("Illustration group not found.");
            }
        } else {
            errorImages = errorImages + "- " + rec_name_formatted + "\n";
        }
        
        // TEMP
        /*var temp = findObject(newGroup, "TEMP");
        if (temp) {
            temp.contents = calculateIngredientSum(rec, ingredients);
        }*/

        // Adjust the group's position to the current artboard
        newGroup.position = [artboardX, artboardY];
    }
}

if (errorImages.length > 0) {
    alert("Image files not found: \n\n" + errorImages + "\nPath: " + 'C:/Users/POR7BP/Documents/_PERSONAL/_MOME/_KALI/Cards v3/Link/Recipes/');
}

// Function to get food illustration files' name
function formatImageFileName(foodName) {
    return foodName.toLowerCase().replace(" ", "-").replace(" ", "-").replace("?","").replace("'","") + '.png';
}

// Function to handle ingredients
function handleIngredients(ingredientsGroup, record, ingredients) {
    var ingredientsOdd = findObject(ingredientsGroup, "Ingredientes Odd");
    var ingredientsEven = findObject(ingredientsGroup, "Ingredientes Even");
    var ingredientList = getIngredientList(rec, ingredients);

    if (ingredientsOdd && ingredientsEven) {
        var ingredientSum = calculateIngredientSum(record, ingredients);
        var isEven = (ingredientSum % 2 == 0);
            
        ingredientsOdd.hidden = true;
        ingredientsEven.hidden = true;

        if (isEven) {
            ingredientsEven.hidden = false;
            var evenItems = ingredientsEven.pageItems;
            handleIngredientSet(evenItems, ingredientList);
        } else {
            ingredientsOdd.hidden = false;
            var oddItems = ingredientsOdd.pageItems;
            handleIngredientSet(oddItems, ingredientList);
        }
    }
}

// Function to show the current card's power type icon
function pickPowerType(powerTypeGroup, bonusType)
{
    var sabotage = findObject(powerTypeGroup, "Sabotage");
    var boost = findObject(powerTypeGroup, "Boost");
    var collab = findObject(powerTypeGroup, "Collab");

    if (sabotage && boost && collab) {
        sabotage.hidden = true;
        boost.hidden = true;
        collab.hidden = true;

        var firstTwoChars = bonusType.substring(0, 2).toLowerCase();

        switch (firstTwoChars) {
            case "sz":  // Szívatás
                sabotage.hidden = false;
                break;
            case "bo":  // Boost
                boost.hidden = false;
                break;
            case "ko":  // Kollab
                collab.hidden = false;
                break;
            default:
                break;
        }
    }
}

// Function to show the correct amount of ingredients in a set
function handleIngredientSet(ingredientItems, ingredientList) {
    for (var i = 0; i < ingredientItems.length; i++) {
        ingredientItems[i].hidden = true;
    }
    var diff = ingredientItems.length - ingredientList.length;
    for (var i = 0 + diff; i < ingredientItems.length; i++) {
        ingredientItems[i].hidden = false;
        chooseIngredient(ingredientItems[i], ingredientList[i - diff]);
    }
}

// Function to create a list of ingredient names based on the record
function getIngredientList(record, ingredients) {
    var ingredientList = [];

    for (var i = 0; i < ingredients.length; i++) {
        var ingredient = ingredients[i];
        var quantity = parseInt(record[ingredient], 10);

        if (!isNaN(quantity) && quantity > 0) {
            for (var j = 0; j < quantity; j++) {
                ingredientList.push(ingredient);
            }
        }
    }

    return ingredientList;
}

// Function to show the correct ingredient
function chooseIngredient(ingredientSet, chosenIngredient) {
    if (ingredientSet.typename !== 'GroupItem') {
        throw new Error('Provided item is not a GroupItem.');
    }

    var items = ingredientSet.pageItems;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        item.hidden = true;
        if (item.name === chosenIngredient) {
            item.hidden = false;
        }
    }
}

doc.fitArtboardToSelectedArt(0);
doc.artboards[0].artboardRect = originalArtboardRect;
var notificationPalette = createNotificationPalette("Script completed!");