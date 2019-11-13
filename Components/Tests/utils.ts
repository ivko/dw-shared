/// <reference path="../../Scripts/Typescript/lib/qunit/qunit.d.ts" />
/// <chutzpah_reference path="../utils.js" />
/// <reference path="../utils.d.ts" />

QUnit.module("Utils", () => {
    //TODO: check if we could implement these tests with proper checks 
    // (maybe would require running the test in different browsers or adding window, navigator etc. as params)
    QUnit.test('isIE', (assert) => {
        assert.ok(true);
    });

    QUnit.test('isFF', (assert) => {
        assert.ok(true);
    });

    QUnit.test('isChrome', (assert) => {
        assert.ok(true);
    });

    QUnit.test('isSafari', (assert) => {
        assert.ok(true);
    });
    //..

    QUnit.test('isTouchEnabled / in browser (TEST MAY FAIL IF STARTED ELSEWHERE) / false', (assert) => {
        assert.notOk(DW.Utils.isTouchEnabled());
    });

    QUnit.test('resolvedDeferred / is resolved? / true', (assert) => {
        assert.deepEqual(DW.Utils.resolvedDeferred.state(), "resolved");
    });

    QUnit.test('rejectedDeferred / is rejected? / true', (assert) => {
        assert.deepEqual(DW.Utils.rejectedDeferred.state(), "rejected");
    });


    QUnit.module('', (hooks) => {
        interface IDeferredWithParamModule {
            TEST_PARAM: string;
        }
        let self: IDeferredWithParamModule;

        hooks.before(() => {
            self = {
                TEST_PARAM: 'test param'
            }
        });

        QUnit.module('resolvedDeferredWithParam', () => {
            QUnit.test('is resolved & has param? / true & param passed', (assert) => {
                let resolvedDeferred = DW.Utils.resolvedDeferredWithParam(self.TEST_PARAM);
                assert.deepEqual(resolvedDeferred.state(), "resolved");
                resolvedDeferred.done((param) => {
                    assert.deepEqual(param, self.TEST_PARAM);
                });
            });

            QUnit.test('null / null', (assert) => {
                let resolvedDeferred = DW.Utils.resolvedDeferredWithParam(null);
                resolvedDeferred.done((param) => {
                    assert.deepEqual(param, null);
                });
            });
        });

        QUnit.module('rejectedDeferredWithParam', () => {
            QUnit.test('is rejected & has param? / true & param passed', (assert) => {
                let rejectedDeferred = DW.Utils.rejectedDeferredWithParam(self.TEST_PARAM);
                assert.deepEqual(rejectedDeferred.state(), "rejected");
                rejectedDeferred.fail((param) => {
                    assert.deepEqual(param, self.TEST_PARAM);
                });
            });

            QUnit.test('null / null', (assert) => {
                let rejectedDeferred = DW.Utils.rejectedDeferredWithParam(null);
                rejectedDeferred.fail((param) => {
                    assert.deepEqual(param, null);
                });
            });
        });
    });

    QUnit.module("handleError", (hooks) => {
        type Options = { show: (message, html) => void, getNoConnectionString: () => string, html?: string };
        interface IHandleErrorModule {
            ERROR_MESSAGE: string;
            NO_CONNECTION_MESSAGE: string;
            ERROR_HTML: string;
            optionsThatShouldNotBeExploited: (assert: QUnitAssert) => Options;
            optionsForNoConnection: (assert: QUnitAssert) => Options;
            optionsForRegularError: (assert: QUnitAssert) => Options;
        }
        let self: IHandleErrorModule,
            error: {
                handled: boolean,
                cancelled: boolean,
                statusCode: number,
                message: string,
                displayOptions?: Options;
            },
            NO_CONNECTION_STATUSES = [0, 408, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511, 599];

        hooks.before(() => {
            self = {
                ERROR_MESSAGE: "TEST ERROR MESSAGE",
                NO_CONNECTION_MESSAGE: "TEST NO CONNECTION",
                ERROR_HTML: "TEST ERROR HTML",
                optionsThatShouldNotBeExploited: (assert: QUnitAssert) => {
                    return {
                        show: (message, html) => assert.notOk(true),
                        getNoConnectionString: () => assert.notOk(true)
                    }
                },
                optionsForNoConnection: (assert: QUnitAssert) => {
                    return {
                        show: (message, html) => assert.deepEqual(message, self.NO_CONNECTION_MESSAGE),
                        getNoConnectionString: () => self.NO_CONNECTION_MESSAGE
                    }
                },
                optionsForRegularError: (assert: QUnitAssert) => {
                    return {
                        show: (message, html) => {
                            assert.deepEqual(message, self.ERROR_MESSAGE);
                            assert.deepEqual(html, self.ERROR_HTML);
                        },
                        getNoConnectionString: () => self.NO_CONNECTION_MESSAGE,
                        html: self.ERROR_HTML
                    }
                }
            };
        });
        hooks.beforeEach(() => {
            error = {
                handled: false,
                cancelled: false,
                statusCode: 402,
                message: self.ERROR_MESSAGE
            };
        });

        QUnit.module('with options as parameter', () => {
            QUnit.test('already handled error / no action', (assert) => {
                error.handled = true;
                DW.Utils.handleError(error, self.optionsThatShouldNotBeExploited(assert));
                assert.expect(0);
            });

            QUnit.test('already cancelled error / no action', (assert) => {
                error.cancelled = true;
                DW.Utils.handleError(error, self.optionsThatShouldNotBeExploited(assert));
                assert.expect(0);
            });

            QUnit.test('regular error / handled & show message logic executed', (assert) => {
                DW.Utils.handleError(error, self.optionsForRegularError(assert));
                assert.ok(error.handled);
                assert.expect(3);
            });
            
            NO_CONNECTION_STATUSES.forEach((statusCode) => {
                QUnit.test('no connection status code ' + statusCode + ' / handled & show no connection message logic executed', (assert) => {
                    error.statusCode = statusCode;
                    DW.Utils.handleError(error, self.optionsForNoConnection(assert));
                    assert.ok(error.handled);
                    assert.expect(2);
                });
            });

        });

        QUnit.module('error with displayOptions', () => {
            QUnit.test('already handled error / no action', (assert) => {
                error.handled = true;
                error.displayOptions = self.optionsThatShouldNotBeExploited(assert);
                DW.Utils.handleError(error);
                assert.expect(0);
            });

            QUnit.test('already cancelled error / no action', (assert) => {
                error.cancelled = true;
                error.displayOptions = self.optionsThatShouldNotBeExploited(assert);
                DW.Utils.handleError(error);
                assert.expect(0);
            });

            QUnit.test('regular error / handled & show message logic executed', (assert) => {
                error.displayOptions = self.optionsForRegularError(assert);
                DW.Utils.handleError(error);
                assert.ok(error.handled);
                assert.expect(3);
            });

            NO_CONNECTION_STATUSES.forEach((statusCode) => {
                QUnit.test('no connection status code ' + statusCode + ' / handled & show no connection message logic executed', (assert) => {
                    error.statusCode = statusCode;
                    error.displayOptions = self.optionsForNoConnection(assert);
                    DW.Utils.handleError(error);
                    assert.ok(error.handled);
                });
            });
        });
    });

    QUnit.module("getPrecision", () => {
        QUnit.test('"12" / 0', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('12'), 0);
        });

        QUnit.test('"12.12" / 2', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('12.12'), 2);
        });

        QUnit.test('"12.123456789012345678901234567890123456789012345678901234567890" / 60', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('12.123456789012345678901234567890123456789012345678901234567890'), 60);
        });

        QUnit.test('"12,12" / 2', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('12,12'), 2);
        });

        QUnit.test('"12,123456789012345678901234567890123456789012345678901234567890" / 60', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('12,123456789012345678901234567890123456789012345678901234567890'), 60);
        });

        QUnit.test('12 / 0', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(12), 0);
        });

        QUnit.test('12.12 / 2', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(12.12), 2);
        });

        QUnit.test('121212.12 / 2', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(121212.12), 2);
        });

        QUnit.test('12.123456789012345678901234567890123456789012345678901234567890 / 15', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(12.123456789012345678901234567890123456789012345678901234567890), 15);
        });

        QUnit.test('121212.12345678901234567890 / 9', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(121212.12345678901234567890), 9);
        });

        QUnit.test('"-12" / 0', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('-12'), 0);
        });

        QUnit.test('"-12.12" / 2', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('-12.12'), 2);
        });

        QUnit.test('"-12.123456789012345678901234567890123456789012345678901234567890" / 60', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('-12.123456789012345678901234567890123456789012345678901234567890'), 60);
        });

        QUnit.test('"-12,12" / 2', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('-12,12'), 2);
        });

        QUnit.test('"-12,123456789012345678901234567890123456789012345678901234567890" / 60', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision('-12,123456789012345678901234567890123456789012345678901234567890'), 60);
        });

        QUnit.test('-12 / 0', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(-12), 0);
        });

        QUnit.test('-12.12 / 2', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(-12.12), 2);
        });

        QUnit.test('-121212.12 / 2', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(-121212.12), 2);
        });

        QUnit.test('-12.123456789012345678901234567890123456789012345678901234567890 / 15', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(-12.123456789012345678901234567890123456789012345678901234567890), 15);
        });

        QUnit.test('-121212.12345678901234567890 / 9', (assert) => {
            assert.deepEqual(DW.Utils.getPrecision(-121212.12345678901234567890), 9);
        });

        QUnit.module("wrong params", () => {
            QUnit.test('"test" / undefined', (assert) => {
                assert.deepEqual(DW.Utils.getPrecision('test'), void 0);
            });

            QUnit.test('"12.12.12" / undefined', (assert) => {
                assert.deepEqual(DW.Utils.getPrecision('12.12.12'), void 0);
            });
        });
    });

    QUnit.module('parseFloat', () => {
        QUnit.test('12 / 12', (assert) => {
            assert.deepEqual(DW.Utils.parseFloat(12), 12);
        });

        QUnit.test('12.12 / 12.12', (assert) => {
            assert.deepEqual(DW.Utils.parseFloat(12.12), 12.12);
        });

        QUnit.test('-12 / -12', (assert) => {
            assert.deepEqual(DW.Utils.parseFloat(-12), -12);
        });

        QUnit.test('-12.12 / -12.12', (assert) => {
            assert.deepEqual(DW.Utils.parseFloat(-12.12), -12.12);
        });

        QUnit.test('"12" / 12', (assert) => {
            assert.deepEqual(DW.Utils.parseFloat('12'), 12);
        });

        QUnit.test('"12.12" / 12.12', (assert) => {
            assert.deepEqual(DW.Utils.parseFloat('12.12'), 12.12);
        });

        QUnit.test('"-12" / -12', (assert) => {
            assert.deepEqual(DW.Utils.parseFloat('-12'), -12);
        });

        QUnit.test('"-12.12" / -12.12', (assert) => {
            assert.deepEqual(DW.Utils.parseFloat('-12.12'), -12.12);
        });

        QUnit.module('wrong params', () => {
            QUnit.test('null / null', (assert) => {
                assert.deepEqual(DW.Utils.parseFloat(null), null);
            });

            QUnit.test('undefined / undefined', (assert) => {
                assert.deepEqual(DW.Utils.parseFloat(void 0), void 0);
            });

            QUnit.test('"" / ""', (assert) => {
                assert.deepEqual(DW.Utils.parseFloat(''), '');
            });
        });
    });

    QUnit.module('getShortTypeName', () => {
        QUnit.test('{ __type: "typeName:http://dev.docuware.com/settings/dependencies/" } / typeName', (assert) => {
            assert.deepEqual(DW.Utils.getShortTypeName({ __type: 'typeName:http://dev.docuware.com/settings/dependencies/' }), 'typeName');
        });

        QUnit.test('{ __type: "typeName:" } / typeName', (assert) => {
            assert.deepEqual(DW.Utils.getShortTypeName({ __type: 'typeName:' }), 'typeName');
        });

        QUnit.test('{ __type: void 0 } / ""', (assert) => {
            assert.deepEqual(DW.Utils.getShortTypeName({ __type: void 0 }), '');
        });

        QUnit.test('{ __type: null } / ""', (assert) => {
            assert.deepEqual(DW.Utils.getShortTypeName({ __type: null }), '');
        });

        QUnit.test('{ __type: 12 } / ""', (assert) => {
            assert.deepEqual(DW.Utils.getShortTypeName({ __type: 12 }), '');
        });

        QUnit.test('{ __type: false } / ""', (assert) => {
            assert.deepEqual(DW.Utils.getShortTypeName({ __type: false }), '');
        });

        QUnit.test('{ __type: "" } / ""', (assert) => {
            assert.deepEqual(DW.Utils.getShortTypeName({ __type: '' }), '');
        });

        QUnit.module('wrong params', () => {
            QUnit.test('{} / ""', (assert) => {
                assert.deepEqual(DW.Utils.getShortTypeName({}), '');
            });

            QUnit.test('undefined / ""', (assert) => {
                assert.deepEqual(DW.Utils.getShortTypeName(void 0), '');
            });

            QUnit.test('null / ""', (assert) => {
                assert.deepEqual(DW.Utils.getShortTypeName(null), '');
            });
        });
    });

    QUnit.module('getSalutations', (hooks) => {
        interface IGetSalutationsModule {
            SALUTATIONS: { de: string[], es: string[], default: string[] }
        }
        let self: IGetSalutationsModule;

        hooks.before(() => {
            self = {
                SALUTATIONS: {
                    de: ['Hr.', 'Fr.'],
                    es: ['Sr.', 'Sra.'],
                    default: ['Mr.', 'Mrs.', 'Ms.']
                }
            }
        });

        QUnit.test('no params / default salutations', (assert) => {
            assert.deepEqual(DW.Utils.getSalutations(), self.SALUTATIONS.default);
        });

        QUnit.test('deutsch salutations key / deutsch salutations', (assert) => {
            assert.deepEqual(DW.Utils.getSalutations(DW.Utils.Salutations.de), self.SALUTATIONS.de);
        });

        QUnit.test('spanish salutations key / spanish salutations', (assert) => {
            assert.deepEqual(DW.Utils.getSalutations(DW.Utils.Salutations.es), self.SALUTATIONS.es);
        });
    });

    QUnit.module('createMapFromArray', (hooks) => {
        QUnit.test('[1,2,3], (element) => String(element) / {"1": 1, "2": 2, "3": 3}', (assert) => {
            assert.deepEqual(DW.Utils.createMapFromArray([1,2,3], (element) => String(element)), {'1': 1, '2': 2, '3': 3});
        });

        QUnit.test('[""], () => "" / {"": ""}', (assert) => {
            assert.deepEqual(DW.Utils.createMapFromArray([''], () => ''), {'': ''});
        });

        QUnit.test('[null], () => "" / {"": null}', (assert) => {
            assert.deepEqual(DW.Utils.createMapFromArray([null], () => ''), {'': null});
        });
    });

});