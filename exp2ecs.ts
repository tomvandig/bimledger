import { ComponentAttribute, ComponentAttributeType, ComponentAttributeValue, ComponentDefinition, ComponentSchema } from "./bl_cli";
interface Type {
    name: string;
    typeName : string;
    isList: boolean;
    isEnum: boolean;
    isSelect: boolean;
    values: string[];
    isType: boolean;
    isEntity: boolean;
}

interface Prop {
    name: string;
    type: string;
    primitive: boolean;
    optional: boolean;
    set: boolean;
}

interface InverseProp {
    name: string;
    type: string;
    set: boolean;
    for: string;
}

interface Entity {
    name: string;
    parent: null | string;
    children: string[];
    props: Prop[];
    inverseProps: InverseProp[],
    derivedProps: Prop[] | null;
    derivedInverseProps: InverseProp[] | null,
    isIfcProduct: boolean;
    isEntity: boolean;
    isType: boolean;
}

interface Param
{
    name: string;
    type: string;
    prop: Prop;
    isType: Type;
}

export function sortEntities(entities: Entity[]) {
    let sortedEntities: Entity[] = [];
    let unsortedEntities: Entity[] = [];
    entities.forEach(val => unsortedEntities.push(val));
    while (unsortedEntities.length > 0)
    {
      for (let i=0; i < unsortedEntities.length; i++) 
      {
        if (unsortedEntities[i].parent == null || sortedEntities.some( e => e.name === unsortedEntities[i].parent))
        {
          sortedEntities.push(unsortedEntities[i]);
        }
      }
      unsortedEntities = unsortedEntities.filter(n => !sortedEntities.includes(n));
    }
    return sortedEntities;
  }

  export function expTypeToTSType(expTypeName)
  {
      let tsType = expTypeName;
      if (expTypeName == "REAL" || expTypeName == "INTEGER" || expTypeName == "NUMBER")
      {
          tsType = "number";
      }
      else if (expTypeName == "STRING")
      {
          tsType = "string";
      }
      else if (expTypeName == "BOOLEAN")
      {
          tsType = "boolean";
      }
      else if (expTypeName == "BINARY")
      {
          tsType = "number";
      }
      else if (expTypeName == "LOGICAL")
      {
          tsType = "boolean";
      }
  
      return tsType;
  }
  
  export function parseInverse(line,entity) 
  {
      let split = line.split(" ");
      let name = split[0].replace("INVERSE","").trim();
      let set = split.indexOf("SET") != -1 || split.indexOf("LIST") != -1;
      let forVal = split[split.length - 1].replace(";", "");
      let type = split[split.length - 3];
      let tsType = expTypeToTSType(type);
      entity.inverseProps.push({
        name,
        type: tsType,
        set,
        for: forVal
      });  
  }
  
  export function parseElements(data)
  {
      let lines = data.split(";");
  
      let entities: Entity[] = [];
      let types: Type[] = [];
      let type: Type | false = false;
      let entity: Entity | false = false;
      let readProps = false;
      let readInverse = false;
  
      for (let i = 0; i < lines.length; i++)
      {
          let line = lines[i].trim();
          let hasColon = line.indexOf(" : ") != -1;
          if (line.indexOf("ENTITY") == 0)
          {
              let split = line.split(" ");
              let name = split[1].trim();
              entity = {
                  name,
                  parent: null,
                  props: [],
                  children: [],
                  derivedProps: [],
                  inverseProps: [],
                  derivedInverseProps: [],
                  isIfcProduct: false,
                  isEntity: true,
                  isType: false
              };
              if (name === "IfcProduct") entity.isIfcProduct = true;
              readProps = true;
              readInverse = false;
  
              let subIndex = split.indexOf("SUBTYPE");
              if (subIndex != -1)
              {
                  let parent = split[subIndex + 2].replace("(", "").replace(")", "");
                  entity.parent = parent;
              }
          }
          else if (line.indexOf("END_ENTITY") == 0)
          {
              if (entity) entities.push(entity);
              readProps = false;
              readInverse = false;
          }
          else if (line.indexOf("WHERE") == 0)
          {
              readProps = false;
              readInverse = false;
          }
          else if (line.indexOf("INVERSE") == 0)
          {
              readProps = false;
              readInverse = true;
              // there is one inverse property on this line
              parseInverse(line,entity);
          }
          else if (line.indexOf("DERIVE") == 0)
          {
              readProps = false;
              readInverse = false;
          }
          else if (line.indexOf("UNIQUE") == 0)
          {
              readProps = false;
              readInverse = false;
          }
          else if (line.indexOf("TYPE") == 0)
          {
              readProps = false;
              readInverse = false;
  
              let split = line.split(" ").map((s) => s.trim());
              let name = split[1];
  
  
              let isList = split.indexOf("LIST") != -1 || split.indexOf("SET") != -1 || split.indexOf("ARRAY") != -1;
              let isEnum = split.indexOf("ENUMERATION") != -1;
              let isSelect = split[3].indexOf("SELECT") == 0;
              let values: null | string[] = null;
  
              let typeName = "";
              if (isList)
              {
                  typeName = split[split.length - 1];
              }
              else if (isEnum || isSelect)
              {
                  let firstBracket = line.indexOf("(");
                  let secondBracket = line.indexOf(")");
  
                  let stringList = line.substring(firstBracket + 1, secondBracket);
                  values = stringList.split(",").map((s) => s.trim());
              }
              else
              {
                  typeName = split[3];
              }
  
              let firstBracket = typeName.indexOf("(");
              if (firstBracket != -1)
              {
                  typeName = typeName.substr(0, firstBracket);
              }
  
              // typeName = expTypeToTSType(typeName);
              
              type = {
                  name,
                  typeName,
                  isList,
                  isEnum,
                  isSelect,
                  values,
                  isType: true,
                  isEntity: false
              }
          }
          else if (line.indexOf("END_TYPE") == 0)
          {
              if (type)
              {
                  types.push(type);
              }
              type = false;
          }
          else if (entity && readInverse && hasColon) 
          {
            parseInverse(line,entity);
          }
          else if (entity && readProps && hasColon)
          {
              // property
              let split = line.split(" ");
              let name = split[0];
              let optional = split.indexOf("OPTIONAL") != -1;
              let set = split.indexOf("SET") != -1 || split.indexOf("LIST") != -1;
              let type = split[split.length - 1].replace(";", "");
              let firstBracket = type.indexOf("(");
              if (firstBracket != -1)
              {
                  type = type.substr(0, firstBracket);
              }
              let tsType = type;//expTypeToTSType(type);
              entity.props.push({
                  name,
                  type: tsType,
                  primitive: tsType !== type,
                  optional,
                  set
              })
          }
      }
  
      return {
          entities,
          types
      };
  }
  
  function findEntity(entityName: String, entityList: Entity[])
  {
    if (entityName == null) return null;
    for (var i=0; i < entityList.length;i++) 
    {
        if (entityList[i].name == entityName)
        {
          return entityList[i];
        }
    }
    return null;
  }
  
  export function findSubClasses(entities: Entity[])
  {
    for (var y = entities.length-1; y >= 0; y-- ) 
    {
        let parent = findEntity(entities[y].parent,entities);
        if (parent == null) continue;
        parent.children.push( ... entities[y].children );
        parent.children.push(entities[y].name)
    }
    return entities;
  }
  
  export function walkParents(entity: Entity, entityList: Entity[])
  {
      let parent = findEntity(entity.parent,entityList);
      if (parent == null) {
        entity.derivedProps  = entity.props;
        entity.derivedInverseProps = entity.inverseProps;
      } else {
        walkParents(parent, entityList);
        if (parent.isIfcProduct) entity.isIfcProduct = true;
        entity.derivedProps = [...parent.derivedProps, ...entity.props];
        entity.derivedInverseProps = [...parent.derivedInverseProps,...entity.inverseProps];
      }
  }

const fs = require("fs");

console.log("Starting...");

export function ParseEXP()
{
    let completeEntityList = new Set();
    completeEntityList.add("FILE_SCHEMA");
    completeEntityList.add("FILE_NAME");
    completeEntityList.add("FILE_DESCRIPTION");
    let completeifcElementList = new Set();

    var files = fs.readdirSync("./");
    for (var i = 0; i < files.length; i++) {
    if (!files[i].endsWith(".exp")) continue;
    var schemaName = files[i].replace(".exp","");
    console.log("Generating Schema for:"+schemaName);

    let schemaData = fs.readFileSync("./"+files[i]).toString();
    let parsed = parseElements(schemaData);
    let entities = sortEntities(parsed.entities);
    let types = parsed.types;
        
    entities.forEach((e) => {
        walkParents(e,entities);
    });
    
    //now work out the children
    entities = findSubClasses(entities);
    
    for (var x=0; x < entities.length; x++) 
    {
        completeEntityList.add(entities[x].name);
        if (entities[x].isIfcProduct)
        {
            completeifcElementList.add(entities[x].name);
        }
    
        if (entities[x].derivedInverseProps.length > 0)
        {
            entities[x].derivedInverseProps.forEach((prop) => {
            let pos = 0;
            //find the target element
            for (let targetEntity of entities) 
            {
                if (targetEntity.name == prop.type) 
                {
                for (let i=0; i < targetEntity.derivedProps.length;i++)
                {
                    if (targetEntity.derivedProps[i].name == prop.for) 
                    {
                        pos = i;
                        break;
                    }
                }
                break;
                }
            }
            let type  = `ifc.${prop.type.toUpperCase()}`
            });
            
        }
    }  

    let nameToObj = {};
    entities.forEach((e) => nameToObj[e.name] = e);
    types.forEach((t) => nameToObj[t.name] = t);

    function print(e)
    {
        e.derivedProps.forEach((p) => {
            console.log(nameToObj[p.type]) 
        });
        console.log(JSON.stringify(e, null, 4));
    }

    function PropTypeToAttrType(typeName: string)
    {
        // TODO: new types
        if (typeName === "NUMBER" || typeName === "REAL" || typeName === "INTEGER")
        {
            return ComponentAttributeType.NUMBER;
        }
        else if (typeName == "STRING")
        {
            return ComponentAttributeType.STRING;
        }
        else if (typeName == "BOOLEAN")
        {
            return ComponentAttributeType.BOOLEAN;
        }
        else if (typeName == "BINARY")
        {
            return ComponentAttributeType.BINARY;
        }
        else if (typeName == "LOGICAL")
        {
            return ComponentAttributeType.LOGICAL;
        }

        throw new Error(`Unkonwn prop type: "${typeName}"`);
    }

    function ToChildAttrVal(propType: Entity | Type)
    {
        let type = ComponentAttributeType.ARRAY;

        if (propType.isType)
        {
            let _type = (propType as Type);
            if (_type.isEnum)
            {
                // TODO: work with values
                type = ComponentAttributeType.STRING;
            }
            else if (_type.isList)
            {
                return {
                    type: ComponentAttributeType.ARRAY,
                    optional: false,
                    child: {
                        type: PropTypeToAttrType(_type.typeName),
                        optional: false,
                        child: null
                    } as ComponentAttributeValue
                } as ComponentAttributeValue
            }
            else if (_type.isSelect)
            {
                // one of
                return {
                    type: ComponentAttributeType.SELECT,
                    optional: false,
                    child: _type.values.map(val => ToChildAttrVal(nameToObj[val]))
                } as ComponentAttributeValue
            }
            else
            {
                let propType = nameToObj[_type.typeName];

                if (propType)
                {
                    return ToChildAttrVal(propType);
                }
                else
                {
                    type = PropTypeToAttrType(_type.typeName)
                }
            }
        }
        else if (propType.isEntity)
        {
            // TODO: specify ref type
            type = ComponentAttributeType.REF;
        }

        return {
            type: type,
            optional: false,
            child: null
        } as ComponentAttributeValue
    }

    function ToAttrVal(prop: Prop)
    {
        let propType = nameToObj[prop.type];

        if (!propType)
        {
            let type = PropTypeToAttrType(prop.type)

            if (prop.set)
            {
                return {
                    type: ComponentAttributeType.ARRAY,
                    optional: prop.optional,
                    child: {
                        type: type,
                        optional: false,
                        child: null
                    }
                } as ComponentAttributeValue
            }
            else
            {
                return {
                    type: type,
                    optional: prop.optional,
                    child: null
                } as ComponentAttributeValue
            }
        }
        else if (prop.set)
        {
            return {
                type: ComponentAttributeType.ARRAY,
                optional: prop.optional,
                child: ToChildAttrVal(propType)
            } as ComponentAttributeValue
        }
        else
        {
            let attr = ToChildAttrVal(propType);
            attr.optional = prop.optional;
            return attr;
        }
    }

    function ToAttribute(prop: Prop)
    {
        let attr: ComponentAttribute = {
            name: prop.name,
            value: ToAttrVal(prop)
        }

        return attr;
    }

    function ToSchema(props: Prop[])
    {
        let schema: ComponentSchema = {
            attributes: props.map((prop) => ToAttribute(prop))
        }

        return schema;
    }

    function ToComponentDefinition(e: Entity)
    {
        let comp: ComponentDefinition = {
            id: ["ifc2x3", e.name.toLocaleLowerCase()],
            parent: null,
            ownership: "any",
            schema: ToSchema(e.derivedProps)
        }

        return comp;
    }

    let definitions = entities.map(e => ToComponentDefinition(e));

    return definitions;
    }

    //finish writing the TS metaData
    console.log(`...Done!`);
}
