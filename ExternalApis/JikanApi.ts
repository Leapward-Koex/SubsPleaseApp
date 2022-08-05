import React from 'react';
import { ShowInfo, SubsPleaseShowApiResult } from '../models/models';
import { parse } from 'fast-html-parser';
import orderBy from 'lodash.orderby';

export class JikanApi {
    static apiBaseUrl = 'https://api.jikan.moe/v4/';
    public static async tryFindShow(showName: string) {
        try {
            const response = await fetch(
                new URL(
                    '/anime/?q=' + encodeURIComponent(showName),
                    JikanApi.apiBaseUrl,
                ).href,
                { cache: 'no-store' },
            );
            if (response.ok) {
                const jikanReponse: JikanAnimeReponse = await response.json();
                console.log(
                    `Jikan query for ${showName} returned ${jikanReponse.data.length} results`,
                );

                const showsWithDefaultTitle = jikanReponse.data.filter(
                    (show) =>
                        show.titles?.length > 0 &&
                        show.titles.filter(
                            (showTitle) => showTitle.type === 'Default',
                        ),
                );
                const rankedShows = showsWithDefaultTitle.map((show) => {
                    return {
                        similarity: this.similarity(
                            showName,
                            show.titles.find(
                                (title) => title.type === 'Default',
                            )!.title,
                        ),
                        show,
                    };
                });
                const sorted = orderBy(rankedShows, ['similarity'], ['desc']);
                return sorted.map((showRanking) => showRanking.show);
            } else {
                console.log(
                    'error',
                    JSON.stringify({
                        status: response.status,
                        statusText: response.statusText,
                    }),
                );
                return [];
            }
        } catch (error) {
            console.log('error', error);
            return [];
        }
    }

    private static similarity(s1: string, s2: string) {
        let longer = s1;
        let shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        const longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (
            (longerLength - this.editDistance(longer, shorter)) / longerLength
        );
    }

    private static editDistance(s1: string, s2: string) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = [];
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                            newValue =
                                Math.min(
                                    Math.min(newValue, lastValue),
                                    costs[j],
                                ) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) {
                costs[s2.length] = lastValue;
            }
        }
        return costs[s2.length];
    }
}

export interface Items {
    count: number;
    total: number;
    per_page: number;
}

export interface Pagination {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: Items;
}

export interface Jpg {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
}

export interface Webp {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
}

export interface Images {
    jpg: Jpg;
    webp: Webp;
}

export interface Images2 {
    image_url: string;
    small_image_url: string;
    medium_image_url: string;
    large_image_url: string;
    maximum_image_url: string;
}

export interface Trailer {
    youtube_id: string;
    url: string;
    embed_url: string;
    images: Images2;
}

export interface Title {
    type: string;
    title: string;
}

export interface From {
    day?: number;
    month?: number;
    year?: number;
}

export interface To {
    day?: number;
    month?: number;
    year?: number;
}

export interface Prop {
    from: From;
    to: To;
}

export interface Aired {
    from?: Date;
    to?: Date;
    prop: Prop;
    string: string;
}

export interface Broadcast {
    day: string;
    time: string;
    timezone: string;
    string: string;
}

export interface Producer {
    mal_id: number;
    type: string;
    name: string;
    url: string;
}

export interface Licensor {
    mal_id: number;
    type: string;
    name: string;
    url: string;
}

export interface Studio {
    mal_id: number;
    type: string;
    name: string;
    url: string;
}

export interface Genre {
    mal_id: number;
    type: string;
    name: string;
    url: string;
}

export interface Theme {
    mal_id: number;
    type: string;
    name: string;
    url: string;
}

export interface Demographic {
    mal_id: number;
    type: string;
    name: string;
    url: string;
}

export interface JikanShow {
    mal_id: number;
    url: string;
    images: Images;
    trailer: Trailer;
    approved: boolean;
    titles: Title[];
    type: string;
    source: string;
    episodes?: number;
    status: string;
    airing: boolean;
    aired: Aired;
    duration: string;
    rating: string;
    score?: number;
    scored_by?: number;
    rank?: number;
    popularity: number;
    members: number;
    favorites: number;
    synopsis: string;
    background: string;
    season: string;
    year?: number;
    broadcast: Broadcast;
    producers: Producer[];
    licensors: Licensor[];
    studios: Studio[];
    genres: Genre[];
    explicit_genres: any[];
    themes: Theme[];
    demographics: Demographic[];
}

export interface Links {
    first: string;
    last: string;
    prev?: any;
    next: string;
}

export interface Link {
    url: string;
    label: string;
    active: boolean;
}

export interface Meta {
    current_page: number;
    from: number;
    last_page: number;
    links: Link[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface JikanAnimeReponse {
    pagination: Pagination;
    data: JikanShow[];
    links: Links;
    meta: Meta;
}
