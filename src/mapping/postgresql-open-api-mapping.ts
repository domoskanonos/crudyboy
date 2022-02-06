import { OpenApiProperty } from "../openapi/open-api-gen";
import { PostgresqlProperty } from "../db/postgresql";

export class PostgresqlOpenApiMapping {
  toOpenApiProperties(pgProperties: PostgresqlProperty[]): OpenApiProperty[] {
    const openApiProperties: any = {};
    pgProperties.forEach((property: PostgresqlProperty) => {
      let udtName = property.udt_name;
      let isVarchar = "varchar".indexOf(udtName) > -1;
      let isText = "text".indexOf(udtName) > -1;
      let isBool = "bool".indexOf(udtName) > -1;
      let isDate = "date".indexOf(udtName) > -1;
      let isTimestamp = "timestamp".indexOf(udtName) > -1;
      let isInt4 = "int4".indexOf(udtName) > -1;
      let isNumeric = "numeric".indexOf(udtName) > -1;
      openApiProperties[property.column_name] = <OpenApiProperty>{
        title: property.column_name,
        type:
          isVarchar || isText
            ? "string"
            : isBool
            ? "boolean"
            : isDate || isTimestamp
            ? "string"
            : isInt4
            ? "integer"
            : isNumeric
            ? "number"
            : null,
        format: isVarchar
          ? ""
          : isBool
          ? ""
          : isDate || isTimestamp
          ? "date"
          : isInt4
          ? "int32"
          : isNumeric
          ? "double"
          : "",
        writeOnly: property.is_updatable != "YES",
        nullable: property.is_nullable == "YES",
        default:
          isVarchar || isText
            ? "Lorem Ipsum"
            : isBool
            ? true
            : isDate
            ? new Date()
            : isInt4 || isNumeric
            ? 0
            : null,
      };

      if (property.character_maximum_length)
        openApiProperties[property.column_name].maxLength =
          property.character_maximum_length;
    });
    return openApiProperties;
  }
}
