/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getDefaultFieldFilter, setFieldFilterProp, doesFieldMatchFilters } from './field_filter';
import { DataViewField } from '@kbn/data-views-plugin/public';

describe('field_filter', function () {
  it('getDefaultFieldFilter should return default filter state', function () {
    expect(getDefaultFieldFilter()).toMatchInlineSnapshot(`
      Object {
        "aggregatable": null,
        "name": "",
        "searchable": null,
        "type": "any",
      }
    `);
  });
  it('setFieldFilterProp should return allow filter changes', function () {
    const state = getDefaultFieldFilter();
    const targetState = {
      aggregatable: true,
      name: 'test',
      searchable: true,
      type: 'string',
    };
    const actualState = Object.entries(targetState).reduce((acc, kv) => {
      return setFieldFilterProp(acc, kv[0], kv[1]);
    }, state);
    expect(actualState).toMatchInlineSnapshot(`
      Object {
        "aggregatable": true,
        "name": "test",
        "searchable": true,
        "type": "string",
      }
    `);
  });
  it('filters a given list', () => {
    const defaultState = getDefaultFieldFilter();
    const fieldList = [
      {
        name: 'bytes',
        displayName: 'Bye,bye,Bytes',
        type: 'number',
        esTypes: ['long'],
        count: 10,
        scripted: false,
        searchable: false,
        aggregatable: false,
      },
      {
        name: 'extension',
        displayName: 'Extension',
        type: 'string',
        esTypes: ['text'],
        count: 10,
        scripted: true,
        searchable: true,
        aggregatable: true,
      },
    ] as DataViewField[];

    [
      { filter: {}, result: ['bytes', 'extension'] },
      { filter: { name: 'by' }, result: ['bytes'] },
      { filter: { name: 'Ext' }, result: ['extension'] },
      { filter: { name: 'Bytes' }, result: ['bytes'] },
      { filter: { aggregatable: true }, result: ['extension'] },
      { filter: { aggregatable: true, searchable: false }, result: [] },
      { filter: { type: 'string' }, result: ['extension'] },
    ].forEach((test) => {
      const filtered = fieldList
        .filter((field) => doesFieldMatchFilters(field, { ...defaultState, ...test.filter }))
        .map((field) => field.name);

      expect(filtered).toEqual(test.result);
    });
  });
});
