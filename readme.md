*This is an experiment for the ifcdelta / ifc5 working group, it is not production software, and does not necessarily work.*

*One of the contributions of this repository is creating a structured diff between two ifc files. Given two IFC files A and B, a diff A' can be computed, such that applying A' to A results in an IFC equivalent to B. Applying the diff and obtaining the new IFC is included.*

*The performance of this implementation is quite bad, ifc files larger than 10mb will take multiple seconds to process. This is not a limitation of the approach, but of the choice of JS/JSON. This will be corrected in the future.*

# Usage

[Demo](https://tomvandig.github.io/bl-deploy/)

### Setup
```sh
# install all dependencies
npm install

npm run build-cli # builds a command line version
npm run build-web # builds a web version

# for development
npm run watch
```

### CLI Usage

```sh
node bl.js help # prints available commands
```

### Web usage

For web usage, only a bundle is built. You should host it yourself, for instance with:

```sh
npm install serve
serve .
# go to localhost:3000
```


# BIMledger
BIMledger combines two ideas: git for BIM and ECS for BIM

**In git for BIM**, the goal is to represent model modifications as small versioned transactions on a bigger model, just like git represents source code edits as transactions on a file. 

The benefit is similar to git: the operations done by the user can be analyzed outside the authoring application, the user only has to communicate small transactions instead of full files, and by combining transactions from multiple users you can collaborate on the same model seamlessly.

**In ECS for BIM**, the goal is to decouple the data representation and validation from a specific schema defined for BIM, giving control of the specifics to the BIM community. Specifically this is done to reject file based thinking and allow for shared ownership, custom data schemas, efficient querying and partial reads.

This repository combines ideas from both in the following way:

* At the core of the system is a ledger, that can be updated with transactions. The ledger itself is the source of truth.
* To update the ledger, one can submit definitions or components as a transaction. The transaction is always added to the end of the ledger. A transaction can remove/add/modify components and definitions.
* Each component has a type, to insert a component into the ledger, there must be a definition for that component type in the ledger, or in the transaction that adds the component. The component is type-checked against the component definition. If the type check fails, the transaction fails. This means the ledger itself is always valid in relation to the definitions it contains, not unlike a database.
* From the ledger, an ECS can be constructed by accumulating all the transactions in the ledger. Typically the ecs is updated after every transaction that is added to the ledger, it remains in sync with the ledger.
* (not implemented) The ledger can be traversed, by the concept of a "current transaction" (HEAD in git). Changing the head of the transaction makes it possible to replay history, looking at the state of the system at any point in time. Changing the current transaction requires applying (or inverting) all transactions between the current and target transaction.
* Using the ECS and ledger, any tool can derive other data that is more useful for their purpose. In this repository, the ECS can be converted to an IFC, and a transaction on the ledger can be converted into an IFC delta. Other tools may convert geometry design trees into triangles, and do so only on the components that have changed.
* To modify the ECS and ledger, a transaction is needed. In this repository, an IFC file can be converted to an ECS and then compared with the current ECS as described by the ledger. This comparison is not straightforward because IFC files coming from authoring tools vary enormously between versions. From the comparison results a transaction. This transaction can be applied to the ledger and a new ECS can be obtained, which itself can be exported to IFC.
* To make an ECS out of an existing IFC, the IFC EXP definition is used (2.3 or 4.0) to create valid ECS definitions. This means that invalid IFC files will be rejected by the system.
* (not implemented) The ledger can be synced with other remote ledgers by sending transactions back and forth.
* If a future version of IFC is released, it is likely that this repository does not need to change.

This repository currently does not implement anything around ownership, views, or querying.
