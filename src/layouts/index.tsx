import '@rainbow-me/rainbowkit/styles.css';
import {getDefaultConfig, RainbowKitProvider,} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {mainnet, polygon, optimism, arbitrum, base, localhost,} from 'wagmi/chains';
import {QueryClientProvider, QueryClient,} from "@tanstack/react-query";


const config = getDefaultConfig({
  appName: 'test-App',
  projectId: '2c934fabad90d42df4df4c9f59f96538',
  chains: [{
    ...localhost,
    rpcUrls: {
      default: { http: ['http://127.0.0.1:7545'] },
    }},mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
const queryClient = new QueryClient();


import { Link, Outlet } from 'umi';
import styles from './index.less';

export default function Layout() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Outlet />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
