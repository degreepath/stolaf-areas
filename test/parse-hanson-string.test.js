import {parse} from '../lib/parse-hanson-string'

describe('parse hanson-string', () => {
    describe('course parsing', () => {
        it('parses courses with a single department', () => {
            expect(parse('CSCI 121')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
            })
        })

        it('parses courses with a two departments', () => {
            expect(parse('AS/ES 121')).to.deep.equal({
                $type: 'course',
                department: ['ASIAN', 'ENVST'],
                number: 121,
            })
        })

        it('parses courses with no departments as having no department', () => {
            expect(parse('121')).to.deep.equal({
                $type: 'course',
                number: 121,
            })
        })

        it('parses courses with sections', () => {
            expect(parse('CSCI 121.A')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                section: 'A',
            })
        })

        it('parses courses with years', () => {
            expect(parse('CSCI 121.A.2014')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                section: 'A',
                year: 2014,
            })
        })

        it('parses courses with semesters', () => {
            expect(parse('CSCI 121.A.2014.1')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                section: 'A',
                year: 2014,
                semester: 1,
            })
        })

        it('requires section to be present if year is', () => {
            expect(() => parse('CSCI 121.2014')).to.throw('Expected "&", "|" or end of input but "." found.')
        })

        it('requires section and year to be present if semester is', () => {
            expect(() => parse('CSCI 121.A.5')).to.throw('Expected "&", "|" or end of input but "." found.')
            expect(() => parse('CSCI 121.5')).to.throw('Expected "&", "|" or end of input but "." found.')
        })

        it('supports wildcard sections', () => {
            expect(parse('CSCI 121.*')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                section: '*',
            })
        })

        it('supports wildcard years', () => {
            expect(parse('CSCI 121.*.*')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                section: '*',
                year: '*',
            })
        })

        it('supports wildcard semesters', () => {
            expect(parse('CSCI 121.*.*.*')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                section: '*',
                year: '*',
                semester: '*',
            })
        })

        it('supports international courses', () => {
            expect(parse('CSCI 121I')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                international: true,
            })
        })

        it('supports labs', () => {
            expect(parse('CSCI 121L')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                lab: true,
            })
        })

        it('requires the lab to be immediately after the number', () => {
            expect(() => parse('CHEM 125 L')).to.throw('Expected "&", "|" or end of input but "L" found.')
            expect(() => parse('CHEM 125IL')).to.not.throw()
            expect(() => parse('CHEM 125L')).to.not.throw()
        })

        it('supports international labs', () => {
            expect(parse('CSCI 121IL')).to.deep.equal({
                $type: 'course',
                department: ['CSCI'],
                number: 121,
                international: true,
                lab: true,
            })
        })

        it('requires international labs to be in IL order', () => {
            expect(() => parse('CSCI 121LI')).to.throw('Expected "&", "|" or end of input but "I" found.')
        })
    })

    describe('boolean parsing', () => {
        it('parses courses seperated by | as being or-d', () => {
            expect(parse('CSCI 121 | CSCI 125')).to.deep.equal({
                $type: 'boolean',
                $or: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 125,
                    },
                ],
            })
        })

        it('parses courses seperated by & as being and-d', () => {
            expect(parse('CSCI 121 & CSCI 125')).to.deep.equal({
                $type: 'boolean',
                $and: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 125,
                    },
                ],
            })
        })

        it('parses courses with no departments after an prior department', () => {
            expect(parse('CSCI 121 | 125')).to.deep.equal({
                $type: 'boolean',
                $or: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 125,
                    },
                ],
            })
        })

        it('changes departments when given a new one', () => {
            expect(parse('CSCI 121 | PSCI 125')).to.deep.equal({
                $type: 'boolean',
                $or: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'course',
                        department: ['PSCI'],
                        number: 125,
                    },
                ],
            })
        })

        it('allows several &-d courses in a row', () => {
            expect(parse('CSCI 121 & 125 & 126 & 123')).to.deep.equal({
                $type: 'boolean',
                $and: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 125,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 126,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 123,
                    },
                ],
            })
        })

        it('allows several |-d courses in a row', () => {
            expect(parse('CSCI 121 | 125 | 126 | 123')).to.deep.equal({
                $type: 'boolean',
                $or: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 125,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 126,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 123,
                    },
                ],
            })
        })

        it('keeps duplicates in a list of courses', () => {
            expect(parse('CSCI 121 | 121 | 125')).to.deep.equal({
                $type: 'boolean',
                $or: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 125,
                    },
                ],
            })
        })

        it('allows a & b | c – boolean logic for courses', () => {
            expect(parse('CSCI 121 & 122 | 123')).to.deep.equal({
                $type: 'boolean',
                $or: [
                    {
                        $type: 'boolean',
                        $and: [
                            {
                                $type: 'course',
                                department: ['CSCI'],
                                number: 121,
                            },
                            {
                                $type: 'course',
                                department: ['CSCI'],
                                number: 122,
                            },
                        ],
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 123,
                    },
                ],
            })
        })

        it('allows a | b & c – boolean logic for courses', () => {
            expect(parse('CSCI 121 | 122 & 123')).to.deep.equal({
                $type: 'boolean',
                $or: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                    {
                        $type: 'boolean',
                        $and: [
                            {
                                $type: 'course',
                                department: ['CSCI'],
                                number: 122,
                            },
                            {
                                $type: 'course',
                                department: ['CSCI'],
                                number: 123,
                            },
                        ],
                    },
                ],
            })
        })

        it('supports parentheses to control order-of-operations - (a | b) & c', () => {
            expect(parse('(CSCI 121 | 122) & 123')).to.deep.equal({
                $type: 'boolean',
                $and: [
                    {
                        $type: 'boolean',
                        $or: [
                            {
                                $type: 'course',
                                department: ['CSCI'],
                                number: 121,
                            },
                            {
                                $type: 'course',
                                department: ['CSCI'],
                                number: 122,
                            },
                        ],
                    },
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 123,
                    },
                ],
            })
        })
    })

    xdescribe('counters', () => {
        xit('n may be in english from "zero" to "twenty"', () => {})
        xit('n may be a number from 0 to (at least) 999', () => {})
    })

    describe('of-statements', () => {
        it('supports of statements of the form "n of ()"', () => {
            expect(() => parse('one of (CHEM 121)')).to.not.throw()
        })
        xit('allows "n" to be a number', () => {
            expect(() => parse('1 of (A, B, C)')).to.not.throw()
        })
        it('allows "n" to be a counter', () => {
            expect(() => parse('three of (A, B, C)')).to.not.throw()
        })
        it('allows "n" to be "all"', () => {
            expect(() => parse('all of (A, B, C)')).to.not.throw()
        })
        it('if n is "all", it is the number of items in the of-parens', () => {
            expect(parse('all of (A, B, C)')).to
                .have.property('$count').and.equal(3)
        })
        it('allows "n" to be "any"', () => {
            expect(() => parse('any of (A, B, C)')).to.not.throw()
        })
        it('allows "n" to be "none"', () => {
            expect(() => parse('none of (A, B, C)')).to.not.throw()
        })

        it('supports boolean statements within the parens', () => {
            expect(parse('one of (A | B & C, D)')).to.deep.equal({
                $type: 'of',
                $count: 1,
                $of: [
                    {
                        $type: 'boolean',
                        $or: [
                            {
                                $type: 'reference',
                                $requirement: 'A',
                            },
                            {
                                $type: 'boolean',
                                $and: [
                                    {
                                        $type: 'reference',
                                        $requirement: 'B',
                                    },
                                    {
                                        $type: 'reference',
                                        $requirement: 'C',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        $type: 'reference',
                        $requirement: 'D',
                    },
                ],
            })
        })
        it('supports courses within the parens', () => {
            expect(parse('one of (CSCI 121)')).to.deep.equal({
                $type: 'of',
                $count: 1,
                $of: [
                    {
                        $type: 'course',
                        department: ['CSCI'],
                        number: 121,
                    },
                ],
            })
        })
        it('supports where-clauses within the parens', () => {
            expect(parse('one of (CSSCI 121, one course where {gereqs = WRI})')).to
                .have.property('$of').and.length(2)
        })
        it('supports occurrences within the parens', () => {
            expect(parse('one of (two occurrences of CSCI 121, CSCI 308)')).to
                .have.property('$of').and.length(2)
        })
        it('supports references within the parens', () => {
            expect(parse('one of (A, B, C, D)')).to
                .have.property('$of').and.length(4)
        })
        it('supports modifiers within the parens', () => {
            expect(parse('one of (two courses from children, two courses from filter, two credits from courses where {year <= 2016})')).to
                .have.property('$of').and.length(3)
        })

        xit('requires that items be seperated by commas', () => {})
        it('supports trailing commas', () => {
            expect(parse('one of (121,)')).to.deep.equal({
                $type: 'of',
                $count: 1,
                $of: [
                    {
                        $type: 'course',
                        number: 121,
                    },
                ],
            })
        })

        it('throws an error if more items are required than are provided', () => {
            expect(() => parse('three of (CSCI 121, 125)')).to.throw('you requested 3 items, but only listed 2 options ([{"$type":"course","department":["CSCI"],"number":121},{"$type":"course","department":["CSCI"],"number":125}])')
        })
    })
    describe('where-statements', () => {
        describe('qualifications', () => {
            it('can be separated by &', () => {
                expect(() => parse('one course where {a = b & c = d}')).not.to.throw()
            })
            it('can be separated by |', () => {
                expect(() => parse('one course where {a = b | c = d}')).not.to.throw()
            })
            it('can used in boolean logic: a & b | c', () => {
                expect(() => parse('one course where {a = b & c = d | c = e}')).not.to.throw()
            })
            it('can used in boolean logic: a | b & c', () => {
                expect(() => parse('one course where {a = b | c = d & c = e}')).not.to.throw()
            })
            it('boolean logic can be overridden by parens: (a | b) & c', () => {
                expect(() => parse('four courses where { dept = THEAT & (num = 233 | num = 253) }')).not.to.throw()
            })
            it('key must be a string', () => {
                expect(() => parse('one course where {a = b}')).not.to.throw()
                expect(() => parse('one course where {1 = b}')).to.throw()
            })
            it('value may include numbers', () => {
                expect(() => parse('one course where {a = 1}')).not.to.throw()
            })
            it('value may include hyphens', () => {
                expect(() => parse('one course where {a = BTS-B}')).not.to.throw()
            })
            it('value may include underscores', () => {
                expect(() => parse('one course where {a = BTS_B}')).not.to.throw()
            })

            xit('value may rely on a nested qualifier', () => {})
            it('function may include a space between the name and the paren', () => {
                expect(parse('one course where { year = max (year) from courses where {gereqs=year} }')).to.deep.equal({
                    $type: 'where',
                    $count: 1,
                    $where: {
                        $type: 'qualification',
                            $key: 'year',
                            $value: {
                            $eq: {
                                $name: 'max',
                                $prop: 'year',
                                $type: 'function',
                                $where: {
                                    $type: 'qualification',
                                    $key: 'gereqs',
                                    $value: {
                                        $eq: 'year',
                                        $type: 'operator',
                                    },
                                },
                            },
                            $type: 'operator',
                        },
                    },
                })
            })
            it('function may not include a space between the name and the paren', () => {
                expect(parse('one course where { year = max(year) from courses where {gereqs=year} }')).to.deep.equal({
                    $type: 'where',
                    $count: 1,
                    $where: {
                        $type: 'qualification',
                        $key: 'year',
                        $value: {
                            $eq: {
                                $name: 'max',
                                $prop: 'year',
                                $type: 'function',
                                $where: {
                                    $type: 'qualification',
                                    $key: 'gereqs',
                                    $value: {
                                        $eq: 'year',
                                        $type: 'operator',
                                    },
                                },
                            },
                            $type: 'operator',
                        },
                    },
                })
            })
            describe('value may be compared by', () => {
                it('= (single equals)', () => {
                    expect(parse('one course where {a = b}')).to
                        .have.deep.property('$where.$value.$eq')
                })
                it('== (double equals)', () => {
                    expect(parse('one course where {a == b}')).to
                        .have.deep.property('$where.$value.$eq')
                })
                it('!= (not equal to)', () => {
                    expect(parse('one course where {a != b}')).to
                        .have.deep.property('$where.$value.$ne')
                })
                it('< (less than)', () => {
                    expect(parse('one course where {a < b}')).to
                        .have.deep.property('$where.$value.$lt')
                })
                it('<= (less than or equal to)', () => {
                    expect(parse('one course where {a <= b}')).to
                        .have.deep.property('$where.$value.$lte')
                })
                it('> (greater than)', () => {
                    expect(parse('one course where {a > b}')).to
                        .have.deep.property('$where.$value.$gt')
                })
                it('=> (greater than or equal to)', () => {
                    expect(parse('one course where {a >= b}')).to
                        .have.deep.property('$where.$value.$gte')
                })
            })
        })
    })
    describe('occurrences', () => {
        it('requires a course to check for occurrences of', () => {
            expect(parse('one occurrence of CSCI 121')).to.deep.equal({
                $type: 'occurrence',
                $count: 1,
                course: {
                    $type: 'course',
                    department: [
                        'CSCI',
                    ],
                    number: 121,
                },
            })
        })
    })
    describe('references', () => {
        it('can reference a requirement', () => {
            expect(parse('BTS-B')).to.deep.equal({
                $type: 'reference',
                $requirement: 'BTS-B',
            })
        })
        it('handles a full requirement title', () => {

            expect(parse('Biblical Studies (BTS-B)')).to
                .have.property('$requirement', 'Biblical Studies (BTS-B)')
        })
        it('returns a full requirement title when given an abbreviation', () => {
            expect(parse('BTS-B', {abbreviations: {'BTS-B': 'Biblical Studies (BTS-B)'}})).to
                .have.property('$requirement', 'Biblical Studies (BTS-B)')
        })
        it('returns a full requirement title when given the title-minus-abbreviation', () => {
            expect(parse('Biblical Studies', {titles: {'Biblical Studies': 'Biblical Studies (BTS-B)'}})).to
                .have.property('$requirement', 'Biblical Studies (BTS-B)')
        })
        describe('titles may include', () => {
            it('letters "A-Z"', () => {
                expect(() => parse('ABC')).not.to.throw()
                expect(() => parse('A')).not.to.throw()
            })
            it('numbers "0-9"', () => {
                expect(() => parse('A0')).not.to.throw()
                expect(() => parse('0')).not.to.throw()
                expect(() => parse('0A')).not.to.throw()
            })
            it('hyphen "-"', () => {
                expect(() => parse('ABC-D')).not.to.throw()
            })
            it('underscore "_"', () => {
                expect(() => parse('ABC_D')).not.to.throw()
            })
            it('parentheses "()"', () => {
                expect(() => parse('A0 (B)')).not.to.throw()
                expect(() => parse('A0 (B-B)')).not.to.throw()
            })
            it('may only begin with a letter or number', () => {
                expect(() => parse('0A')).not.to.throw()
                expect(() => parse('A0')).not.to.throw()
                expect(() => parse('_A0')).to.throw()
                expect(() => parse('-A0')).to.throw()
                expect(parse('(A0)')).to.have.property('$type', 'reference')
            })
        })
    })
    describe('modifiers', () => {
        it('can count courses', () => {
            expect(parse('one course from children')).to.deep.equal({
                $type: 'modifier',
                $count: 1,
                $what: 'course',
                $from: 'children',
                $children: '$all',
            })
        })
        it('can count credits', () => {
            expect(parse('one credit from children')).to.deep.equal({
                $type: 'modifier',
                $count: 1,
                $what: 'credit',
                $from: 'children',
                $children: '$all',
            })
        })
        it('can count departments', () => {
            expect(parse('one department from children')).to.deep.equal({
                $type: 'modifier',
                $count: 1,
                $what: 'department',
                $from: 'children',
                $children: '$all',
            })
        })
        it('will not count departments from courses-where', () => {
            expect(() => parse('one department from children')).not.to.throw()
            expect(() => parse('one department from filter')).not.to.throw()
            expect(() => parse('one department from courses where {a = b}')).to.throw()
        })
        it('can count from children', () => {
            expect(parse('one course from children')).to.deep.equal({
                $type: 'modifier',
                $count: 1,
                $what: 'course',
                $from: 'children',
                $children: '$all',
            })
        })
        it('can count from specified children', () => {
            expect(parse('one course from (A, B)')).to.deep.equal({
                $type: 'modifier',
                $count: 1,
                $what: 'course',
                $from: 'children',
                $children: [{$requirement: 'A', $type: 'reference'}, {$requirement: 'B', $type: 'reference'}],
            })

            expect(parse('one course from (BTS-B, B)', {abbreviations: {'BTS-B': 'Bible'}})).to.deep.equal({
                $type: 'modifier',
                $count: 1,
                $what: 'course',
                $from: 'children',
                $children: [{$requirement: 'Bible', $type: 'reference'}, {$requirement: 'B', $type: 'reference'}],
            })
        })
        it('can count from filter', () => {
            expect(parse('one course from filter')).to.deep.equal({
                $type: 'modifier',
                $count: 1,
                $what: 'course',
                $from: 'filter',
            })
        })
        it('can count from where-statement', () => {
            expect(parse('one course from courses where {a = b}')).to.deep.equal({
                $type: 'modifier',
                $count: 1,
                $what: 'course',
                $from: 'where',
                $where: {
                    $type: 'qualification',
                    $key: 'a',
                    $value: {
                        $eq: 'b',
                        $type: 'operator',
                    },
                },
            })
        })
    })
})