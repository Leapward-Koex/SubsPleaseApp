import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Storage } from '../services/Storage';
import { StorageKeys } from '../enums/enum';

describe('Storage tests', () => {
    it('Returns default when nothing stored', async () => {
        jest.spyOn(AsyncStorage, 'getItem').mockResolvedValue(null);
        const value = await Storage.getItem<any[]>(
            StorageKeys.AnalyticsEnabled,
            [],
        );
        expect(value).toEqual([]);
    });
});
