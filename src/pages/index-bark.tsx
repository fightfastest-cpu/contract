import {useEffect, useState} from "react";
import {BrowserProvider, ethers} from "ethers";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import {Button, Layout, message, Space, Table} from "antd";
import {Config, useConnectorClient} from "wagmi";
import {JsonRpcSigner} from "ethers/src.ts";

import ModalAddress from "@/pages/components/ModalAddress";
import ModalBalance from "@/pages/components/ModalBalance";

const { Header, Footer, Sider, Content } = Layout;

type TableData =  {
  address:string,
  balance:string,
  state:string,
}

export default function HomePage() {
  const [list,setList] = useState<TableData[]>([]);
  const [upListCount,setUpListCount] = useState(1);
  const [ provider,setProvider ] = useState<BrowserProvider>()
  const [ signer,setSigner ] = useState<JsonRpcSigner>()

  const { data: client } = useConnectorClient<Config>();

  useEffect(()=>{
    if(client ==null) {
      return
    }
  //  提供者
    let browserProvider = new ethers.BrowserProvider(client.transport)
    setProvider(browserProvider);

  //   签名者
    browserProvider.getSigner(0).then(res=>{
      console.log('res', res);
      setSigner(res)
    })

    return ()=>{
      if(provider){
        provider.destroy()
        setProvider(undefined)
        setSigner(undefined)
      }
    }
  },[client])

  const upBalance = async ()=>{
    let arr: TableData[] = []
    for (let i=0;i<list.length;i++) {
      const data = list[i];
      const val = await provider?.getBalance(data.address)
      data.balance = ethers.formatEther(val?val:0)
      arr.push(data)
    }
    return arr;
  }
  useEffect(() => {
    upBalance().then(res=>{
      setList(res)
    })
  }, [upListCount]);

  const onHash = async (hash:string) => {
    let transition = await provider?.getTransaction(hash)
    if(!transition){return}

    if(transition.from !==signer?.address){
      return
    }

    setList(prevState => {
      let vs:TableData[] = []
      for(let i=0;i<prevState.length;i++){
        const data = prevState[i]
        if(data.address == transition.to){
          data.state = '交易正在处理。。。'
        }
        vs.push(data)
      }
      return vs;
    })

    provider?.once(hash, (tx)=>{
      setList(prevState => {
        let vs:TableData[] = []
        for(let i=0;i<prevState.length;i++){
          const data = prevState[i]
          if(data.address == tx.to){
            data.state = '交易已入账'
          }else {
            data.state = '交易失败'
          }
          vs.push(data)
        }
        return vs;
      })
    })
  }
  useEffect(() => {
    if(!client || !provider || !signer){
      return
    }
    
    let jsonRpcProvider = new ethers.JsonRpcProvider(client.chain.rpcUrls.default.http[0])
    jsonRpcProvider.addListener('pending', hash=>onHash(hash))
  }, [client ,provider ,signer]);
  return (
    <div>
      <Layout >
        <Header >
          <Space>
            <div style={{color:'white'}}>ETH批量转账</div>
            <ConnectButton />
          </Space>
        </Header>
        <Content>
          <Table dataSource={list} columns={[
            {title: '地址', key: 'address',dataIndex:'address'},
            {title: '可用余额', key: 'balance',dataIndex:'balance'},
            {title: '状态', key: 'state',dataIndex:'state'},
          ]} />;
        </Content>
        <Footer style={{textAlign: 'center'}}>
          <Space>
            <ModalBalance signer={signer} onOk={val=>{
              console.log(val);
              if(!list.length){
                message.error('没有数据')
                return
              }

              for(let i=0;i<list.length;i++) {
                const tx = {
                  to: list[i].address,
                  value:val
                }
                signer?.sendTransaction(tx).then(res=>{
                  console.log('res', res);
                  message.success('转账成功')
                })
              }
            }}></ModalBalance>
            <Button type="primary" onClick={()=>{
              if(!list.length){
                message.error('无需刷新')
                return
              }
              setUpListCount(prev=>prev+1)
              message.success('刷新成功')
            }}>刷新余额</Button>
            <ModalAddress onOk={res=>{
              let arr:any[] = []
              res.forEach((item:any) => {
                arr.push({address:item,key:item})
              })
              setList(arr)
              setUpListCount(prev=>prev+1)
            }}></ModalAddress>
          </Space>
        </Footer>
      </Layout>
    </div>
  );
}
