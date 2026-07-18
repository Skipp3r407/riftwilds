# Gateway Network

## What is a Gateway Stone?

One major stone per launch region (`gateway-{regionId}`). Placed in blueprints via `gatewayStoneAt()`.

- **Discovery:** first physical visit activates the stone permanently.
- **Fast travel:** only between activated stones.
- **Fees:** Credits by unlock tier, or **free** between early hubs (Commons / Ember / Coast / Elderwood). Never SOL.

## Art / SFX

| Asset | Path |
|-------|------|
| Stone icon | `/assets/ui/map/gateway-stone.png` |
| Travel loading | `/assets/ui/travel/travel-loading.png` |
| Activate SFX | `world.gateway_activate` |
| Fast travel SFX | `world.fast_travel` |
| Portal SFX | `world.portal` |

## Activation cinematic stub

On first activation, Live World shows a short dialogue from the Gateway Stone (cinematic stub). Rewards: Codex entry key, exploration XP/points, one-time Credits, optional achievements (`gateway_network_5`, `gateway_network_12`).

## Map surfaces

- **World map:** activated stones listed; click region → travel preview + CTA.
- **Regional map:** filter `gateways`; amber pins.
- **Minimap:** gateway landmark pins use Gateway art.
- **In-world:** interact (E) → open travel map.

## Party / caravan stubs

- `createPartyTravelInvite` / `respondPartyTravelInvite` — accept/decline stubs.
- `NPC_CARAVAN_STUBS` — optional Credits rides along spine (never SOL).
