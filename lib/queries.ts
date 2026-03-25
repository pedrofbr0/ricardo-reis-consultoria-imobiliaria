// lib/queries.ts
export const propertiesQuery = `
  *[_type == "property" && active == true] | order(order asc) {
    _id,
    title,
    slug,
    image,
    tag,
    tagType,
    price,
    location,
    attributes,
    whatsappMessage,
  }
`