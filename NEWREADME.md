# Table of Contents

-   [Introduction](#introduction)
-   [File Type and Basic Structure](#file-type-and-basic-structure)

## Introduction

...

## File Type and Top-Level Structure

All configuration files are in the YAML file format. Following conventions for using YAML, data is organized in a hierarchy of sections. The leftmost section is the top-level section and contains one or more sub-sections, which are indented.

All files begin with a quasi-front matter section. This includes:

```yaml
---
name: <string>
type: degree | major | concentration
code: <string>
```

The name field is used for the descriptive name of the degree, major, or concentration. Typically, this can include phrases such as `B.A.` or `Nordic Studies`. The type field is used to indicate the level of study for the file. The only values used here are either `degree`, `major`, or `concentration`. The code field is used for a unique identifier for the file and is typically a number as a string or the degree name.

For files that have a type of _major_ or _concentration_, there is also an additional field for `degree:` that indicates the degree that is associated with either the major or concentration.

Other top-level sections include:

-   limit
-   result
-   requirements
-   emphases
-   multicountable

## Limit

Used at the top level, limit can be applied globally to all requirements and emphases sections.

-   at-most: <number>
    where: <arguments>

## Result

Used at teh top level, result is a means to aggregate the individual requirement sets, which have their own logic.

Subsections can include:

-   **all** - followed by an array of requirements

-   **count/of**
    count: <number> | any | all
    of: array of requirements

-   **audit** - logic that is applied to the entire result set of requirements

## Requirements

Requirements are the discreet list of specific requirements for each sub-section of a degree, major, or concentration.

## Emphases

Defines requirements for a designated emphasis within a degree, major, or concentration.

## Multicountable

Indicates that a requirement can be counted multiple times.
