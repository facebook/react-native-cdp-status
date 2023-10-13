// Copyright (c) Meta Platforms, Inc. and affiliates.
// Copyright 2014 The Chromium Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Original: https://github.com/ChromeDevTools/devtools-protocol/blob/a60ce47e580a5c6cca8ccf2b4616ee3b3e4f2d62/scripts/protocol-schema.d.ts

/**  Definition for protocol.json types */
export interface IProtocol {
  version: Protocol.Version;
  domains: Protocol.Domain[];
}

export module Protocol {
  export interface Version {
    major: string;
    minor: string;
  }

  export interface Feature {
    deprecated?: boolean;
    experimental?: boolean;
  }

  export interface Domain extends Feature {
    /** Name of domain */
    domain: string;
    /** Description of the domain */
    description?: string;
    /** Dependencies on other domains */
    dependencies?: string[];
    /** Types used by the domain. */
    types?: DomainType[];
    /** Commands accepted by the domain */
    commands?: Command[];
    /** Events fired by domain */
    events?: Event[];
  }

  export interface Command extends Event {
    returns?: PropertyType[];
    async?: boolean;
    redirect?: string;
  }

  export interface Event extends Feature {
    name: string;
    parameters?: PropertyType[];
    /** Description of the event */
    description?: string;
  }

  export interface ArrayType {
    type: 'array';
    /** Maps to a typed array e.g string[] */
    items: RefType | PrimitiveType | StringType | AnyType | ObjectType;
    /** Cardinality of length of array type */
    minItems?: number;
    maxItems?: number;
  }

  export interface ObjectType {
    type: 'object';
    /** Properties of the type. Maps to a typed object */
    properties?: PropertyType[];
  }

  export interface StringType {
    type: 'string';
    /** Possible values of a string. */
    enum?: string[];
  }

  export interface PrimitiveType {
    type: 'number' | 'integer' | 'boolean';
  }

  export interface AnyType {
    type: 'any';
  }

  export interface RefType {
    /** Reference to a domain defined type */
    $ref: string;
  }

  export interface PropertyBaseType extends Feature {
    /** Name of param */
    name: string;
    /** Is the property optional ? */
    optional?: boolean;
    /** Description of the type */
    description?: string;
  }

  type DomainType = {
    /** Name of property */
    id: string;
    /** Description of the type */
    description?: string;
  } & (StringType | ObjectType | ArrayType | PrimitiveType) &
    Feature;

  type ProtocolType =
    | StringType
    | ObjectType
    | ArrayType
    | PrimitiveType
    | RefType
    | AnyType;

  type PropertyType = PropertyBaseType & ProtocolType;
}
