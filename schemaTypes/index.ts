import neighborhood from "./neighborhood";
import property from "./property";
import propertyCategory from "./propertyCategory";
import propertyType from "./propertyType";
import characteristic from "./characteristic";
import siteSettings from "./siteSettings";

export const schemaTypes = [
    // Main documents
    property, 
    
    // Taxonomy documents
    propertyCategory,
    propertyType,
    characteristic,
    neighborhood,

    // Configuration documents
    siteSettings
]
