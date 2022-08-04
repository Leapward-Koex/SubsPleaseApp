import React from 'react';
import { ShowInfo, SubsPleaseShowApiResult } from '../models/models';
import { parse } from 'fast-html-parser';

export class RedditApi {
    static apiBaseUrl = 'https://www.reddit.com';
    public static async tryFindDiscussionThread(showInfo: ShowInfo) {
        try {
            const response = await fetch(
                new URL(
                    `/r/anime/search.json?q=${encodeURIComponent(
                        `${showInfo.show} - Episode ${showInfo.episode.replace(
                            /^0+/,
                            '',
                        )} discussion`,
                    )}&restrict_sr=on`,
                    RedditApi.apiBaseUrl,
                ).href,
                { cache: 'no-store' },
            );
            if (response.ok) {
                const redditResponse: RedditResponse = await response.json();
                const discussionThreads = redditResponse.data.children.filter(
                    (thread) =>
                        thread.data.title.includes(
                            showInfo.episode.replace(/^0+/, ''),
                        ) && thread.data.link_flair_css_class === 'episode',
                );
                console.log(
                    `Reddit query for show ${showInfo.show} ep ${showInfo.episode} discussion thread returned ${discussionThreads.length} results`,
                );

                return discussionThreads[0];
            } else {
                console.log(
                    'error',
                    JSON.stringify({
                        status: response.status,
                        statusText: response.statusText,
                    }),
                );
            }
        } catch (error) {
            console.log('error', error);
        }
    }
}

export interface Facets {}

export interface LinkFlairRichtext {
    e: string;
    t: string;
}

export interface MediaEmbed {}

export interface RedditVideo {
    bitrate_kbps: number;
    fallback_url: string;
    height: number;
    width: number;
    scrubber_media_url: string;
    dash_url: string;
    duration: number;
    hls_url: string;
    is_gif: boolean;
    transcoding_status: string;
}

export interface SecureMedia {
    reddit_video: RedditVideo;
}

export interface SecureMediaEmbed {}

export interface AuthorFlairRichtext {
    a: string;
    e: string;
    u: string;
    t: string;
}

export interface Gildings {
    gid_1: number;
    gid_2?: number;
}

export interface ResizedIcon {
    url: string;
    width: number;
    height: number;
}

export interface ResizedStaticIcon {
    url: string;
    width: number;
    height: number;
}

export interface AllAwarding {
    giver_coin_reward?: any;
    subreddit_id?: any;
    is_new: boolean;
    days_of_drip_extension?: any;
    coin_price: number;
    id: string;
    penny_donate?: any;
    award_sub_type: string;
    coin_reward: number;
    icon_url: string;
    days_of_premium?: number;
    tiers_by_required_awardings?: any;
    resized_icons: ResizedIcon[];
    icon_width: number;
    static_icon_width: number;
    start_date?: any;
    is_enabled: boolean;
    awardings_required_to_grant_benefits?: any;
    description: string;
    end_date?: any;
    sticky_duration_seconds?: any;
    subreddit_coin_reward: number;
    count: number;
    static_icon_height: number;
    name: string;
    resized_static_icons: ResizedStaticIcon[];
    icon_format: string;
    icon_height: number;
    penny_price?: number;
    award_type: string;
    static_icon_url: string;
}

export interface RedditVideo2 {
    bitrate_kbps: number;
    fallback_url: string;
    height: number;
    width: number;
    scrubber_media_url: string;
    dash_url: string;
    duration: number;
    hls_url: string;
    is_gif: boolean;
    transcoding_status: string;
}

export interface Media {
    reddit_video: RedditVideo2;
}

export interface Source {
    url: string;
    width: number;
    height: number;
}

export interface Resolution {
    url: string;
    width: number;
    height: number;
}

export interface Source2 {
    url: string;
    width: number;
    height: number;
}

export interface Resolution2 {
    url: string;
    width: number;
    height: number;
}

export interface Obfuscated {
    source: Source2;
    resolutions: Resolution2[];
}

export interface Variants {
    obfuscated: Obfuscated;
}

export interface Image {
    source: Source;
    resolutions: Resolution[];
    variants: Variants;
    id: string;
}

export interface Preview {
    images: Image[];
    enabled: boolean;
}

export interface ThreadData {
    approved_at_utc?: any;
    subreddit: string;
    selftext: string;
    author_fullname: string;
    saved: boolean;
    mod_reason_title?: any;
    gilded: number;
    clicked: boolean;
    title: string;
    link_flair_richtext: LinkFlairRichtext[];
    subreddit_name_prefixed: string;
    hidden: boolean;
    pwls: number;
    link_flair_css_class: string;
    downs: number;
    thumbnail_height?: number;
    top_awarded_type: string;
    hide_score: boolean;
    name: string;
    quarantine: boolean;
    link_flair_text_color: string;
    upvote_ratio: number;
    author_flair_background_color: string;
    subreddit_type: string;
    ups: number;
    total_awards_received: number;
    media_embed: MediaEmbed;
    thumbnail_width?: number;
    author_flair_template_id: string;
    is_original_content: boolean;
    user_reports: any[];
    secure_media: SecureMedia;
    is_reddit_media_domain: boolean;
    is_meta: boolean;
    category?: any;
    secure_media_embed: SecureMediaEmbed;
    link_flair_text: string;
    can_mod_post: boolean;
    score: number;
    approved_by?: any;
    is_created_from_ads_ui: boolean;
    author_premium: boolean;
    thumbnail: string;
    edited: any;
    author_flair_css_class: string;
    author_flair_richtext: AuthorFlairRichtext[];
    gildings: Gildings;
    content_categories: string[];
    is_self: boolean;
    mod_note?: any;
    created: number;
    link_flair_type: string;
    wls: number;
    removed_by_category?: any;
    banned_by?: any;
    author_flair_type: string;
    domain: string;
    allow_live_comments: boolean;
    selftext_html: string;
    likes?: any;
    suggested_sort?: any;
    banned_at_utc?: any;
    view_count?: any;
    archived: boolean;
    no_follow: boolean;
    is_crosspostable: boolean;
    pinned: boolean;
    over_18: boolean;
    all_awardings: AllAwarding[];
    awarders: any[];
    media_only: boolean;
    link_flair_template_id: string;
    can_gild: boolean;
    spoiler: boolean;
    locked: boolean;
    author_flair_text: string;
    treatment_tags: any[];
    visited: boolean;
    removed_by?: any;
    num_reports?: any;
    distinguished?: any;
    subreddit_id: string;
    author_is_blocked: boolean;
    mod_reason_by?: any;
    removal_reason?: any;
    link_flair_background_color: string;
    id: string;
    is_robot_indexable: boolean;
    report_reasons?: any;
    author: string;
    discussion_type?: any;
    num_comments: number;
    send_replies: boolean;
    whitelist_status: string;
    contest_mode: boolean;
    mod_reports: any[];
    author_patreon_flair: boolean;
    author_flair_text_color: string;
    permalink: string;
    parent_whitelist_status: string;
    stickied: boolean;
    url: string;
    subreddit_subscribers: number;
    created_utc: number;
    num_crossposts: number;
    media: Media;
    is_video: boolean;
    post_hint: string;
    url_overridden_by_dest: string;
    preview: Preview;
}

export interface Thread {
    kind: string;
    data: ThreadData;
}

export interface Data {
    modhash: string;
    dist: number;
    facets: Facets;
    after: string;
    geo_filter: string;
    children: Thread[];
    before?: any;
}

export interface RedditResponse {
    kind: string;
    data: Data;
}
