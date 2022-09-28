import React from 'react';
import { Appearance, Linking, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { RedditApi, Thread } from '../../../ExternalApis/RedditApi';
import { ShowInfo } from '../../../models/models';
import { useStore } from '../../../stores/RootStore';
import { BottomModalButton } from './BottomModalButton';
import { observer } from 'mobx-react-lite';
import { action } from 'mobx';

interface BottomModalProps {
    showInfo: ShowInfo;
}

export const BottomModal = observer(({ showInfo }: BottomModalProps) => {
    const [redditThread, setRedditThread] = React.useState<Thread>();
    const { watchedEpisodeStore, watchListStore } = useStore();

    const { colors } = useTheme();
    const backgroundColor =
        Appearance.getColorScheme() !== 'light'
            ? colors.subsPleaseDark2
            : colors.subsPleaseLight1;

    React.useEffect(() => {
        const getRedditThread = async () => {
            const thread = await RedditApi.tryFindDiscussionThread(showInfo);
            if (thread) {
                setRedditThread(thread);
            }
        };
        getRedditThread();
    }, [showInfo]);
    return (
        <View
            style={{
                backgroundColor,
                height: watchListStore.isShowOnWatchList(showInfo) ? 130 : 90,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: 20,
                paddingLeft: 20,
                paddingRight: 20,
            }}
        >
            {watchListStore.isShowOnWatchList(showInfo) && (
                <BottomModalButton
                    iconName="new-box"
                    text={`Mark as ${
                        watchedEpisodeStore.isShowNew(showInfo)
                            ? 'watched'
                            : 'new'
                    }`}
                    onPress={action(() => {
                        watchedEpisodeStore.setShowWatched(
                            showInfo,
                            watchedEpisodeStore.isShowNew(showInfo),
                        );
                    })}
                />
            )}

            <BottomModalButton
                iconName="open-in-new"
                text="Open Reddit thread"
                loading={!redditThread}
                onPress={() =>
                    redditThread
                        ? Linking.openURL(redditThread.data.url)
                        : undefined
                }
            />
        </View>
    );
});
