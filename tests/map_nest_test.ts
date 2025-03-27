import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can add a new location",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('map-nest', 'add-location', [
        types.ascii("Test Location"),
        types.ascii("Test Description"),
        types.uint(123456),
        types.uint(-123456),
        types.ascii("restaurant")
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
    
    const response = chain.callReadOnlyFn(
      'map-nest',
      'get-location',
      [types.uint(1)],
      deployer.address
    );
    
    response.result.expectOk().expectSome();
  }
});

Clarinet.test({
  name: "Can add a review to location",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // First add a location
    let block = chain.mineBlock([
      Tx.contractCall('map-nest', 'add-location', [
        types.ascii("Test Location"),
        types.ascii("Test Description"),
        types.uint(123456),
        types.uint(-123456),
        types.ascii("restaurant")
      ], deployer.address)
    ]);
    
    // Then add a review
    block = chain.mineBlock([
      Tx.contractCall('map-nest', 'add-review', [
        types.uint(1),
        types.uint(5),
        types.ascii("Great place!")
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "Can claim unclaimed location",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Add location
    let block = chain.mineBlock([
      Tx.contractCall('map-nest', 'add-location', [
        types.ascii("Test Location"),
        types.ascii("Test Description"),
        types.uint(123456),
        types.uint(-123456),
        types.ascii("restaurant")
      ], deployer.address)
    ]);
    
    // Claim location
    block = chain.mineBlock([
      Tx.contractCall('map-nest', 'claim-location', [
        types.uint(1)
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
  }
});
