import assertKeys from './assert-keys'
import assign from 'lodash/object/assign'
import checkForCourse from './check-for-course'
import collectMatches from './collect-matches'
import compact from 'lodash/array/compact'
import countCourses from './count-courses'
import countCredits from './count-credits'
import countDepartments from './count-departments'
import every from 'lodash/collection/every'
import filterByWhereClause from './filter-by-where-clause'
import find from 'lodash/collection/find'
import findCourse from './find-course'
import getMatchesFromChildren from './get-matches-from-children'
import getMatchesFromFilter from './get-matches-from-filter'
import getOccurrences from './get-occurrences'
import has from 'lodash/object/has'
import includes from 'lodash/collection/includes'
import map from 'lodash/collection/map'
import omit from 'lodash/object/omit'

// Compute Functions:
// There are two types of compute functions: those that need the surrounding
// context, and those that don't.
// And, of course, the function that dispatches the appropriate compute:

export default function computeChunk(expr, ctx, courses) {
    if (typeof expr !== 'object') {
        throw new TypeError(`computeChunk(): the expr \`${expr}\` must be an object, not a ${typeof expr}`)
    }
    assertKeys(expr, '$type')
    const type = expr.$type

    let computed = false
    if (type === 'boolean') {
        computed = computeBoolean(expr, ctx, courses)
    }
    else if (type === 'course') {
        computed = computeCourse(expr, courses)
    }
    else if (type === 'modifier') {
        computed = computeModifier(expr, ctx, courses)
    }
    else if (type === 'occurrence') {
        computed = computeOccurrence(expr, courses)
    }
    else if (type === 'of') {
        computed = computeOf(expr, ctx, courses)
    }
    else if (type === 'reference') {
        computed = computeReference(expr, ctx)
    }
    else if (type === 'where') {
        computed = computeWhere(expr, courses)
    }

    expr._result = computed
    return computed
}


export function computeBoolean(expr, ctx, courses) {
    if (has(expr, '$or')) {
        // we only want this to use the first "true" result. we don't need to
        // continue to look after we find one, because this is an or-clause
        const result = find(expr.$or, req => computeChunk(req, ctx, courses))
        expr._matches = collectMatches(expr)
        return Boolean(result)
    }

    else if (has(expr, '$and')) {
        const results = map(expr.$and, req => computeChunk(req, ctx, courses))
        expr._matches = collectMatches(expr)
        return every(results)
    }

    else {
        throw new TypeError(`computeBoolean(): neither $or nor $and could be found in ${expr}`)
    }
}


export function computeCourse(expr, courses) {
    const query = omit(expr, '$type')

    if (checkForCourse(query, courses)) {
        assign(expr, findCourse(query, courses))
        return true
    }

    return false
}


export function computeModifier(expr, ctx, courses) {
    assertKeys(expr, '$what', '$count', '$from')
    const what = expr.$what

    if (!includes(['course', 'department', 'credit'], what)) {
        throw new SyntaxError(`computeModifier(): ${what} is not a valid source`)
    }

    let filtered = []

    if (expr.$from === 'children') {
        filtered = getMatchesFromChildren(expr, ctx)
    }

    else if (expr.$from === 'filter') {
        filtered = getMatchesFromFilter(ctx)
    }

    else if (expr.$from === 'where') {
        assertKeys(expr, '$where')
        filtered = filterByWhereClause(courses, expr.$where)
    }

    expr._matches = filtered

    let num = undefined
    if (what === 'course') {
        num = countCourses(filtered)
    }

    else if (what === 'department') {
        num = countDepartments(filtered)
    }

    else if (what === 'credit') {
        num = countCredits(filtered)
    }

    expr._counted = num
    return num >= expr.$count
}


export function computeOccurrence(expr, courses) {
    assertKeys(expr, '$course', '$count')

    const clause = omit(expr, ['department', 'number', 'section'])
    const filtered = getOccurrences(clause, courses)
    expr._matches = filtered

    return filtered.length >= expr.$count
}


export function computeOf(expr, ctx, courses) {
    assertKeys(expr, '$of', '$count')

    const evaluated = map(expr.$of, req =>
        computeChunk(req, ctx, courses))

    const truthy = compact(evaluated)
    expr.$has = truthy.length
    expr._matches = collectMatches(expr)

    return expr.$has >= expr.$count
}


export function computeReference(expr, ctx) {
    assertKeys(expr, '$requirement')

    if (has(ctx, expr.$requirement)) {
        const target = ctx[expr.$requirement]
        expr._matches = target.result._matches
        return target.computed
    }
    else {
        throw new ReferenceError(`computeReference(): the requirement "${expr.$requirement}" does not exist in the provided context.`)
    }
}


export function computeWhere(expr, courses) {
    assertKeys(expr, '$where', '$count')

    const filtered = filterByWhereClause(courses, expr.$where)
    expr._matches = filtered

    return filtered.length >= expr.$count
}