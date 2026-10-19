import { useState } from 'react';
import { Platform } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { Art, ArtButton, GameCanvas } from './primitives';
import { BackCloud, FrontCloud } from './motion';

export function FeedbackScreen({ offline = false }: { offline?: boolean }) {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{returnTo?:string}>();
  const [retrying, setRetrying] = useState(false);
  const goBack = () => { if(returnTo)router.replace(returnTo as Href);else if(router.canGoBack())router.back();else router.dismissTo('/home'); };
  const retry = () => {
    if(Platform.OS==='web' && typeof navigator!=='undefined' && !navigator.onLine){setRetrying(true);setTimeout(()=>setRetrying(false),1000);return;}
    goBack();
  };
  return <GameCanvas background={offline?'No_Internet_Screen/Sky.png':'Oops_Screen/Sky.png'}>
    <BackCloud y={110} />
    <Art asset={offline?'No_Internet_Screen/no_wifi_icon.png':'Oops_Screen/warning.png'} x={offline?123:131} y={offline?179:231} w={offline?148:132} />
    <Art asset={offline?'No_Internet_Screen/no_internet.png':'Oops_Screen/oops.png'} x={15.5} y={offline?335:375} w={362} />
    <Art asset="general/Stone.png" x={7} y={offline?274:314} w={84.75} />
    <Art asset="general/Paper.png" x={336} y={offline?397:434} w={48} />
    <Art asset="general/Scissors.png" x={51} y={offline?487:528} w={48.5} />
    <FrontCloud y={680} />
    <ArtButton x={112.5} y={offline?509:549} w={168.25} title={offline?(retrying?'OFFLINE':'RETRY'):'OK'} disabled={retrying} onPress={offline?retry:goBack} />
    {offline && <ArtButton x={112.5} y={601} w={168.25} title="HOME" onPress={()=>router.dismissTo('/home')} />}
  </GameCanvas>;
}
