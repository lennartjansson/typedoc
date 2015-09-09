import * as ts from "typescript";

import {Context} from "../../Context";
import {Converter} from "../../Converter";
import {Type} from "../../../models/Type";
import {convertType, TypeNodeConverter} from "../type";
import {convertNode} from "../node";
import {TupleType} from "../../../models/types/TupleType";
import {ReflectionKind} from "../../../models/Reflection";
import {DeclarationReflection} from "../../../models/reflections/DeclarationReflection";
import {ReflectionType} from "../../../models/types/ReflectionType";


export class DestructuringConverter implements TypeNodeConverter<ts.Type, ts.BindingPattern>
{
    /**
     * Test whether this converter can handle the given TypeScript node.
     */
    supportsNode(context:Context, node:ts.BindingPattern):boolean {
        return node.kind === ts.SyntaxKind.ArrayBindingPattern;
    }


    /**
     * Convert the given binding pattern to its type reflection.
     *
     * @param context  The context object describing the current state the converter is in.
     * @param node  The binding pattern that should be converted.
     * @returns The type reflection representing the given binding pattern.
     */
    convertNode(context:Context, node:ts.BindingPattern):Type {
        if (node.kind == ts.SyntaxKind.ArrayBindingPattern) {
            var types:Type[] = [];
            node.elements.forEach((element) => {
                types.push(convertType(context, element));
            });
            return new TupleType(types);
        } else {
            var declaration = new DeclarationReflection();
            declaration.kind = ReflectionKind.TypeLiteral;
            declaration.name = '__type';
            declaration.parent = context.scope;

            context.registerReflection(declaration, null);
            context.trigger(Converter.EVENT_CREATE_DECLARATION, declaration, node);
            context.withScope(declaration, () => {
                node.elements.forEach((element) => {
                    convertNode(context, element);
                });
            });

            return new ReflectionType(declaration);
        }
    }
}