import { createClient, chains } from 'genlayer-js'
import type { LeaderboardEntry, Room, RoomSpec, RoomStatus, Submission } from '../types'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined

const STUDIONET_CHAIN_ID_HEX = '0xf22f'
const STUDIONET_PARAMS = {
  chainId: STUDIONET_CHAIN_ID_HEX,
  chainName: 'Genlayer Studio Network',
  rpcUrls: ['https://studio.genlayer.com/api'],
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  blockExplorerUrls: [],
}

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

type ContractRoom = {
  title: string
  prompt: string
  rubric: string
  status: RoomStatus
  created_by: string
  duration_minutes: number
  submissions: Submission[]
  leaderboard: LeaderboardEntry[]
  reasoning: string
  xp_total: number
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

let cachedAddress: `0x${string}` | null = null
let cachedClient: ReturnType<typeof createClient> | null = null

function getProvider(): Eip1193Provider {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Wallet not detected.')
  }
  return window.ethereum
}

async function ensureStudionet(provider: Eip1193Provider): Promise<void> {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET_CHAIN_ID_HEX }],
    })
  } catch (error) {
    const code = (error as { code?: number })?.code
    if (code === 4902 || code === -32603) {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [STUDIONET_PARAMS],
      })
      return
    }
    throw error
  }
}

export function isEnabled(): boolean {
  return Boolean(CONTRACT_ADDRESS)
}

export function getUserAddress(): `0x${string}` | null {
  return cachedAddress
}

export async function connectWallet(): Promise<`0x${string}`> {
  const provider = getProvider()
  const accounts = (await provider.request({
    method: 'eth_requestAccounts',
  })) as string[]
  if (!accounts?.[0]) throw new Error('No wallet account returned.')
  await ensureStudionet(provider)
  cachedAddress = accounts[0] as `0x${string}`
  cachedClient = createClient({
    chain: chains.studionet,
    account: cachedAddress,
    provider: provider as never,
  })
  return cachedAddress
}

export function disconnectWallet(): void {
  cachedAddress = null
  cachedClient = null
}

function requireClient() {
  if (!cachedClient || !cachedAddress) throw new Error('Wallet not connected.')
  if (!CONTRACT_ADDRESS) throw new Error('VITE_CONTRACT_ADDRESS is not set.')
  return { client: cachedClient, contract: CONTRACT_ADDRESS }
}

function normalizeRoom(id: string, data: ContractRoom): Room {
  return {
    id,
    title: data.title,
    prompt: data.prompt,
    rubric: data.rubric,
    status: data.status,
    createdBy: data.created_by,
    durationMinutes: Number(data.duration_minutes),
    submissions: data.submissions ?? [],
    leaderboard: data.leaderboard ?? [],
    reasoning: data.reasoning ?? '',
    xpTotal: Number(data.xp_total),
  }
}

export async function listRooms(): Promise<Room[]> {
  const { client, contract } = requireClient()
  const result = (await client.readContract({
    address: contract,
    functionName: 'list_rooms',
  })) as { room_ids: string[]; rooms: Record<string, ContractRoom> }

  return (result.room_ids ?? [])
    .map((id) => (result.rooms?.[id] ? normalizeRoom(id, result.rooms[id]) : null))
    .filter((room): room is Room => room !== null)
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const { client, contract } = requireClient()
  const result = await client.readContract({
    address: contract,
    functionName: 'get_room',
    kwargs: { room_id: roomId },
  })
  if (!result || typeof result !== 'object' || Object.keys(result as object).length === 0) {
    return null
  }
  return normalizeRoom(roomId, result as ContractRoom)
}

export async function seedRooms(specs: RoomSpec[]): Promise<`0x${string}`> {
  const { client, contract } = requireClient()
  const hash = await client.writeContract({
    address: contract,
    functionName: 'seed_rooms',
    kwargs: { specs_json: JSON.stringify(specs) },
    value: 0n,
  })
  await client.waitForTransactionReceipt({ hash })
  return hash
}

export async function createRoom(spec: RoomSpec): Promise<`0x${string}`> {
  const { client, contract } = requireClient()
  const hash = await client.writeContract({
    address: contract,
    functionName: 'create_room',
    kwargs: {
      room_id: spec.id,
      title: spec.title,
      prompt: spec.prompt,
      rubric: spec.rubric,
      duration_minutes: spec.duration_minutes,
      xp_total: spec.xp_total,
    },
    value: 0n,
  })
  await client.waitForTransactionReceipt({ hash })
  return hash
}

export async function submitAnswer(
  roomId: string,
  displayName: string,
  answer: string,
): Promise<`0x${string}`> {
  const { client, contract } = requireClient()
  const hash = await client.writeContract({
    address: contract,
    functionName: 'join_and_submit',
    kwargs: { room_id: roomId, display_name: displayName, answer },
    value: 0n,
  })
  await client.waitForTransactionReceipt({ hash })
  return hash
}

export async function lockRoom(roomId: string): Promise<`0x${string}`> {
  const { client, contract } = requireClient()
  const hash = await client.writeContract({
    address: contract,
    functionName: 'lock_room',
    kwargs: { room_id: roomId },
    value: 0n,
  })
  await client.waitForTransactionReceipt({ hash })
  return hash
}

export async function finalizeRoom(roomId: string): Promise<`0x${string}`> {
  const { client, contract } = requireClient()
  const hash = await client.writeContract({
    address: contract,
    functionName: 'finalize_room',
    kwargs: { room_id: roomId },
    value: 0n,
  })
  await client.waitForTransactionReceipt({ hash })
  return hash
}

