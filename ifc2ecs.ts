import { Component, ComponentAttributeInstance, ComponentAttributeType, ComponentAttributeValue, ComponentDefinition, ComponentSchema, ComponentTypeToString, ECS, NamedComponentAttributeInstance } from "./bl_core";

enum IfcTokenType
{
    UNKNOWN = 0,
    STRING,
    LABEL,
    ENUM,
    REAL,
    REF,
    EMPTY,
    SET_BEGIN,
    SET_END,
    LINE_END
};

const READ_BUF_SIZE = 1024 * 1024; // 1 mb

class LineParser
{
    data_ptr = 0;
    schema_ptr = 0;
    data: any[];
    schema: ComponentSchema;
    attrInstances: NamedComponentAttributeInstance[] = [];

    constructor(d: any[], s: ComponentSchema)
    {
        this.data = d;
        this.schema = s;
    }

    AtEnd()
    {
        return this.data_ptr === this.data.length;
    }

    ParseAttribute(schemaValue: ComponentAttributeValue)
    {
        let type = this.data[this.data_ptr++] as IfcTokenType;

        if (type === IfcTokenType.LABEL)
        {
            // label inside of the data field means this is a named type, the middle finger of the express specification
            // we read the label string and continue in a state of deep regret and confusion

            let specificType = this.data[this.data_ptr++];

            let openingBrace = this.data[this.data_ptr++];

            if (openingBrace !== IfcTokenType.SET_BEGIN)
            {
                throw new Error(`No opening brace for named type!`);
            }

            let nestedObj = { 
                type: ComponentAttributeType.LABEL,
                namedType: specificType,
                val: this.ParseAttribute(schemaValue)
                } as ComponentAttributeInstance;

            let closingBrace = this.data[this.data_ptr++];

            if (closingBrace !== IfcTokenType.SET_END)
            {
                throw new Error(`No closing brace for named type!`);
            }

            return nestedObj;
        }

        if (type === IfcTokenType.UNKNOWN)
        {
            // we always approve this
            return { 
                type: ComponentAttributeType.INHERIT,
                val: "*"
                } as ComponentAttributeInstance;
        }

        if (schemaValue.optional && type === IfcTokenType.EMPTY)
        {
            // optional & empty, all good
            return { 
                type: schemaValue.type,
                val: null
                } as ComponentAttributeInstance;
        }
        else
        {
            if (schemaValue.type === ComponentAttributeType.STRING)
            {
                if (type !== IfcTokenType.STRING)
                {
                    throw new Error(`Bad type ${type} found for string`);
                }
                else
                {
                    // type match
                    return { 
                        type: ComponentAttributeType.STRING,
                        val: this.data[this.data_ptr++]
                     } as ComponentAttributeInstance;
                }
            }
            else if (schemaValue.type === ComponentAttributeType.ENUM)
            {
                if (type !== IfcTokenType.ENUM)
                {
                    throw new Error(`Bad type ${type} found for enum`);
                }
                else
                {
                    // type match
                    return { 
                        type: ComponentAttributeType.ENUM,
                        val: this.data[this.data_ptr++]
                     } as ComponentAttributeInstance;
                }
            }
            else if (schemaValue.type === ComponentAttributeType.REF)
            {
                if (type !== IfcTokenType.REF)
                {
                    throw new Error(`Bad type ${type} found for ref`);
                }
                else
                {
                    // type match
                    return { 
                        type: ComponentAttributeType.REF,
                        val: this.data[this.data_ptr++]
                     } as ComponentAttributeInstance;
                }
            }
            else if (schemaValue.type === ComponentAttributeType.NUMBER)
            {
                if (type !== IfcTokenType.REAL)
                {
                    throw new Error(`Bad type ${type} found for number`);
                }
                else
                {
                    // type match
                    return { 
                        type: ComponentAttributeType.NUMBER,
                        val: this.data[this.data_ptr++]
                     } as ComponentAttributeInstance;
                }
            }
            else if (schemaValue.type === ComponentAttributeType.BOOLEAN)
            {
                if (type !== IfcTokenType.ENUM)
                {
                    throw new Error(`Bad type ${type} found for boolean`);
                }
                else
                {
                    // type match
                    return { 
                        type: ComponentAttributeType.BOOLEAN,
                        val: this.data[this.data_ptr++] === "T"
                     } as ComponentAttributeInstance;
                }
            }
            else if (schemaValue.type === ComponentAttributeType.LOGICAL)
            {
                if (type !== IfcTokenType.ENUM)
                {
                    throw new Error(`Bad type ${type} found for boolean`);
                }
                else
                {
                    // type match
                    return { 
                        type: ComponentAttributeType.LOGICAL,
                        val: this.data[this.data_ptr++] === "T"
                     } as ComponentAttributeInstance;
                }
            }
            else if (schemaValue.type === ComponentAttributeType.SELECT)
            {
                // for this value, any of the listed child type values are valid
                let childTypes = schemaValue.child as ComponentAttributeValue[];
                
                let attr: ComponentAttributeInstance | null = null;

                let saved_ptr = this.data_ptr - 1;
                for (let i = 0; i < childTypes.length; i++)
                {
                    this.data_ptr = saved_ptr;


                    let type = childTypes[i];
                    try {
                        attr = this.ParseAttribute(type);
                        break;
                    }catch(e)
                    {
                        // nope not this one
                       // console.log(e);
                    }
                }

                if (!attr)
                {
                   // console.log(this.data, this.data_ptr);
                   // console.log(JSON.stringify(schemaValue, null, 4));
                    throw new Error(`None of the select types match!`);
                }
                else
                {
                    return attr;
                }
            }
            else if (schemaValue.type === ComponentAttributeType.ARRAY)
            {
                if (type !== IfcTokenType.SET_BEGIN)
                {
                    throw new Error(`Bad type ${type} found for array`);
                }
                else
                {
                    let arr: ComponentAttributeInstance[] = [];

                    let arrayType = this.data[this.data_ptr];

                    while (arrayType !== IfcTokenType.SET_END)
                    {
                        arr.push(this.ParseAttribute(schemaValue.child as ComponentAttributeValue));
                        
                        arrayType = this.data[this.data_ptr];
                    }

                    this.data_ptr++;

                    // type match
                    return { 
                        type: ComponentAttributeType.ARRAY,
                        val: arr
                     } as ComponentAttributeInstance;
                }
            }
            else
            {
                throw new Error(`Unsupported type ${schemaValue.type}`);
            }
        }
    }

    ParseNewAttribute()
    {
        if (this.schema.attributes.length <= this.schema_ptr)
        {
            throw new Error(`Exceeded schema length ${this.schema_ptr} ${this.schema.attributes.length}`);
        }

        let attr = this.schema.attributes[this.schema_ptr++];
        let schemaValue = attr.value;

       // console.log("schema", JSON.stringify(this.schema, null, 4));

        return {
            name: attr.name,
            val: this.ParseAttribute(schemaValue)
        } as NamedComponentAttributeInstance;
    }

    ParseLineDataToSchema()
    {
        // console.log(JSON.stringify(this.schema, null, 4));

        while (!this.AtEnd())
        {
            this.attrInstances.push(this.ParseNewAttribute());
        }

        return this.attrInstances;
    }

}

function ParseLineToSchema(line: Line, definition: ComponentDefinition)
{
    return new LineParser(line.data, definition.schema).ParseLineDataToSchema();
}

function FindGuidForComponent(component: NamedComponentAttributeInstance[])
{
    let guid = null;
    component.forEach((attr) => {
        if (attr.name === "GlobalId")
        {
            guid = attr.val.val;
        }
    })

    return guid;
}

function ClearGuidForComponent(component: NamedComponentAttributeInstance[])
{
    component.forEach((attr) => {
        if (attr.name === "GlobalId")
        {
            attr.val.val = "";
        }
    })
}

function ClearComponentValues(component: NamedComponentAttributeInstance[])
{
    component.forEach((attr) => {
        attr.val.type = ComponentAttributeType.STRING
        attr.val.val = "";
    });
}

export default function ConvertIFCToECS(stringData: string, definitions: ComponentDefinition[])
{
    let tokenizer = new Tokenizer();

    let ptr = 0;
    tokenizer.Tokenize((data: Uint8Array, size: number) => {
        let start = ptr;
        let end = Math.min(ptr + size, stringData.length);

        for (let i = start; i < end; i++)
        {
            let index = i - start;
            data[index] = stringData.charCodeAt(i);
        }

        ptr = end;

        return end - start;
    });

    let parser = new Parser(tokenizer._tape);

    parser.ParseTape();

    let schemaMap: any = {};
    definitions.forEach((def) => {
        schemaMap[ComponentTypeToString(def.id)] = def;
    });

    let components: Component[] = [];

    for (let i = 0; i < parser._lines.length; i++)
    {
        let line = parser._lines[i];
        
        let lineType = ComponentTypeToString([`ifc2x3`, line.type.toLocaleLowerCase()]);
        let definition = schemaMap[lineType] as ComponentDefinition;

        if (!definition)
        {
            throw new Error(`Unknown line type ${lineType}`);
        }

        let result = ParseLineToSchema(line, definition);

        // we clear the guids of relationships since they don't appear to be consistent between revisions and clutter the diff
        // other contenders for modified guids are: IFCELEMENTQUANTITY, IFCPROPERTYSET
        if (definition.isRelationShip) ClearGuidForComponent(result);
        // if (definition.isIfcOwnerHistory) ClearComponentValues(result); // this is now solved by overriding the hash of the ifcownerhistory type

        let component: Component = {
            ref: line.id,
            hash: "",
            guid: !definition.isRelationShip ? FindGuidForComponent(result) : null,
            type: ["ifc2x3", line.type.toLocaleLowerCase()],
            data: result   
        }

        components.push(component);
    }

    return new ECS(definitions, components);
}

class Line {
    id: number;
    type: string;
    data: any[];
}

function BuildLine(lineData: any[], currentExpressID: number, currentIfcType: string)
{
    let l = new Line();
    l.id = currentExpressID;
    l.type = currentIfcType;
    l.data = lineData.slice(1, lineData.length - 2);
    return l;
}

class Parser {
    
    _tape: any[] = [];
    _line: any[] = [];
    _lines: Line[] = [];

    constructor(tape: any[])
    {
        this._tape = tape;
    }

    ParseTape()
    {
        let maxExpressId = 0;
        let currentIfcType = "";
        let currentExpressID = 0;
        let insideLine = false;

        let ptr = 0;
        while (ptr != this._tape.length)
        {
            let t = this._tape[ptr++] as IfcTokenType;

            if (t === IfcTokenType.SET_BEGIN)
            {
                insideLine = true;
            }

            if (insideLine) this._line.push(t);

            switch (t)
            {
            case IfcTokenType.LINE_END:
            {
                if (currentExpressID != 0)
                {
                    this._lines.push(BuildLine(this._line, currentExpressID, currentIfcType));

                    // build line
                    /*
                    IfcLine l;
                    l.expressID = currentExpressID;
                    l.ifcType = currentIfcType;
                    l.lineIndex = static_cast<uint32_t>(_metaData.lines.size());
                    l.tapeOffset = currentTapeOffset;
                    l.tapeEnd = this._tape.GetReadOffset();

                    _metaData.ifcTypeToLineID[l.ifcType].push_back(l.lineIndex);
                    maxExpressId = std::max(maxExpressId, l.expressID);

                    _metaData.lines.push_back(std::move(l));
                    */
                }
                else if (currentIfcType != "")
                {
                    // header stuff
                    /*
                    if(currentIfcType == ifc::FILE_DESCRIPTION || currentIfcType == ifc::FILE_NAME||currentIfcType == ifc::FILE_SCHEMA )
                    {
                        IfcHeaderLine l;
                        l.ifcType = currentIfcType;
                        l.lineIndex = static_cast<uint32_t>(_metaData.headerLines.size());
                        l.tapeOffset = currentTapeOffset;
                        l.tapeEnd = this._tape.GetReadOffset();

                        _metaData.ifcTypeToHeaderLineID[l.ifcType].push_back(l.lineIndex);
                        _metaData.headerLines.push_back(std::move(l));
                    }
                    */
                }

                // reset
                insideLine = false;
                currentExpressID = 0;
                currentIfcType = "";
                this._line = [];

                break;
            }
            case IfcTokenType.UNKNOWN:
            case IfcTokenType.EMPTY:
            case IfcTokenType.SET_BEGIN:
            case IfcTokenType.SET_END:
                break;
            case IfcTokenType.STRING:
            case IfcTokenType.ENUM:
            case IfcTokenType.REAL:
            {
                let item = this._tape[ptr++];
                if (insideLine) this._line.push(item);

                break;
            }
            case IfcTokenType.LABEL:
            {
                let label = this._tape[ptr++];
                if (insideLine) this._line.push(label);

                if (currentIfcType === "")
                {
                    currentIfcType = label;
                }

                break;
            }
            case IfcTokenType.REF:
            {
                let ref = this._tape[ptr++];
                if (insideLine) this._line.push(ref);

                if (currentExpressID == 0)
                {
                    currentExpressID = ref;
                }

                break;
            }
            default:
                break;
            }
        }
    }
};

class BufferPointer
{
    prev: number;
    cur: number;
    next: number;

    bufPos = 0;
    bufLength = 0;

    _requestData;
    _readBuffer: Int8Array;

    done = false;

    constructor()
    {
        this._readBuffer = new Int8Array(READ_BUF_SIZE);
    }

    Advance()
    {
        this.bufPos++;

        if (!this.done && this.AtEnd())
        {
            this.bufPos = 0;
            this.bufLength = this._requestData(this._readBuffer, READ_BUF_SIZE);
            this.done = this.bufLength == 0;
        }

        this.prev = this.cur;
        this.cur = this.next;
        this.next = this.done ? 0 : this._readBuffer[this.bufPos];
    }

    AtEnd()
    {
        return this.bufPos >= this.bufLength;
    }
};


export class Tokenizer {
    _temp = [];
    _tape = [];
    
    _ptr: BufferPointer;

    constructor()
    {
        this._ptr = new BufferPointer();
    }

    Tokenize(requestData: any)
    {
        this._ptr._requestData = requestData;
        this._ptr.bufPos = 1;
        this._ptr.bufLength = 0;
        this._ptr.Advance();
        this._ptr.Advance();

        let numLines = 0;
        while (this.TokenizeLine())
        {
            numLines++;
        }

        return numLines;
    }

    TokenizeLine()
    {
        let eof = false;
        
        while (true)
        {
            if (this._ptr.done)
            {
                eof = true;
                break;
            }

            const c = this._ptr.cur;

            let isWhiteSpace = c == ' '.charCodeAt(0) || c == '\n'.charCodeAt(0) || c == '\r'.charCodeAt(0) || c == '\t'.charCodeAt(0);
            
            if (isWhiteSpace)
            {
                this._ptr.Advance();
                continue;
            }

            if (c == '\''.charCodeAt(0))
            {
                this._ptr.Advance();
                let prevSlash = false;
                this._temp = [];
                // apparently I dont fully understand strings in IFC yet
                // this example from uptown shows that escaping is not used: 'Type G5 - 800kg/m\X2\00B2\X0\';
                // this example from revit shows that double quotes are used as one quote: 'RPC Tree - Deciduous:Scarlet Oak - 42'':946835'
                // turns out this is just part of ISO 10303-21, thanks ottosson!
                while (true)
                {
                    this._temp.push(this._ptr.cur);
                    // if its a quote, maybe its the end of the string
                    if (this._ptr.cur == '\''.charCodeAt(0))
                    {
                        // if there's another quote behind it, its not
                        if (this._ptr.next == '\''.charCodeAt(0))
                        {
                            // we also bump pos, otherwise we still break next loop...
                            this._ptr.Advance();
                            this._temp.push(this._ptr.cur);
                        }
                        else
                        {
                            this._temp.pop();
                            break;
                        }
                    }

                    this._ptr.Advance();
                }

                /*if (need_to_decode(_temp))
                    _temp = p21decoder(_temp).unescape();*/

                this._tape.push(IfcTokenType.STRING);
                this._tape.push(String.fromCharCode(...this._temp));
            } 
            else if (c == '#'.charCodeAt(0))
            {
                this._ptr.Advance();

                let num = this.readInt();

                this._tape.push(IfcTokenType.REF);
                this._tape.push(num);

                // skip next advance
                continue;
            }
            else if (c == '$'.charCodeAt(0))
            {
                this._tape.push(IfcTokenType.EMPTY);
            }
            else if (c == '*'.charCodeAt(0))
            {
                if (this._ptr.prev == '/'.charCodeAt(0))
                {
                    this._ptr.Advance();

                    // comment
                    while (!(this._ptr.prev == '*'.charCodeAt(0) && this._ptr.cur == '/'.charCodeAt(0)))
                    {
                        this._ptr.Advance();
                    }
                }
                else
                {
                    this._tape.push(IfcTokenType.UNKNOWN);
                }
            }
            else if (c == '('.charCodeAt(0))
            {
                this._tape.push(IfcTokenType.SET_BEGIN);
            }
            else if (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0))
            {
                let negative = this._ptr.prev == '-'.charCodeAt(0);
                let value = this.readDouble();
                if (negative)
                {
                    value *= -1;
                }

                this._tape.push(IfcTokenType.REAL);
                this._tape.push(value);

                // skip next advance
                continue;
            }
            else if (c == '.'.charCodeAt(0))
            {
                this._temp = [];
                this._ptr.Advance();
                while (this._ptr.cur != '.'.charCodeAt(0))
                {
                    this._temp.push(this._ptr.cur);
                    this._ptr.Advance();
                }

                this._tape.push(IfcTokenType.ENUM);
                this._tape.push(String.fromCharCode(...this._temp));
            }
            else if ((c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) || (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)))
            {
                this._temp = [];
                while ((this._ptr.cur >= 'A'.charCodeAt(0) && this._ptr.cur <= 'Z'.charCodeAt(0)) || (this._ptr.cur >= 'a'.charCodeAt(0) && this._ptr.cur <= 'z'.charCodeAt(0)) || (this._ptr.cur >= '0'.charCodeAt(0) && this._ptr.cur <= '9'.charCodeAt(0)) || this._ptr.cur == '_'.charCodeAt(0))
                {
                    this._temp.push(this._ptr.cur);
                    this._ptr.Advance();
                }

                this._tape.push(IfcTokenType.LABEL);
                this._tape.push(String.fromCharCode(...this._temp));

                // skip next advance
                continue;
            }
            else if (c == ')'.charCodeAt(0))
            {
                this._tape.push(IfcTokenType.SET_END);
            }
            else if (c == ';'.charCodeAt(0))
            {
                this._tape.push(IfcTokenType.LINE_END);
                this._ptr.Advance();

                break;
            }

            this._ptr.Advance();
        }

        
        return !eof && !this._ptr.done;
    }
    
    readInt()
    {
        let val = 0;
        let c = this._ptr.cur;

        this._temp = [];
        
        while (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0))
        {
            this._temp.push(c);
            this._ptr.Advance();
            c = this._ptr.cur;
        }

        return parseInt(String.fromCharCode(...this._temp));
    }

    readDouble()
    {
        let c = this._ptr.cur;

        this._temp = [];

        while ((this._ptr.cur >= '0'.charCodeAt(0) && this._ptr.cur <= '9'.charCodeAt(0)) || (this._ptr.cur == '.'.charCodeAt(0)) || this._ptr.cur == 'e'.charCodeAt(0) || this._ptr.cur == 'E'.charCodeAt(0) || this._ptr.cur == '-'.charCodeAt(0) || this._ptr.cur == '+'.charCodeAt(0))
        {
            this._temp.push(this._ptr.cur);
            this._ptr.Advance();
        }

        let d = parseFloat(String.fromCharCode(...this._temp));

        return d;
    }
}