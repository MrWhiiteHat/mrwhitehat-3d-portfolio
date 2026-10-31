import { CTF_CHALLENGES, getChallengeById } from '../src/utils/ctf/ctfChallenges.js';
import { ctfEngine } from '../src/utils/ctf/ctfEngine.js';
import { verifyFlagHash } from '../src/utils/ctf/cryptoUtils.js';

console.log('========================================');
console.log('RUNNING AUTOMATED CTF ENGINE TEST SUITE');
console.log('========================================\n');

// 1. Verify all 14 challenges and test flags
const KNOWN_FLAGS = {
  'crypto-caesar-tumbler': 'FLAG{caesar_shift_rot3_clearance}',
  'forensics-hardware-uart': 'FLAG{uart_baud_115200_logic_analyzed}',
  'rev-duckyscript-badusb': 'FLAG{ducky_hid_injection_decoded}',
  'pwn-stack-matrix-buffer': 'FLAG{buffer_overflow_eip_overwritten_0x55}',
  'forensics-pcap-exfiltration': 'FLAG{pcap_dns_exfil_basic_auth_neutralized}',
  'web-sqli-waf-bypass': 'FLAG{sqli_union_select_waf_bypassed}',
  'stego-spectrogram-carrier': 'FLAG{stego_audio_watermark_demodulated}',
  'web-sidechannel-timing': 'FLAG{side_channel_timing_leak_enumerated}',
  'net-lateral-pivot-ad': 'FLAG{lateral_movement_chisel_pivot_established}',
  'rev-anti-debug-patch': 'FLAG{binary_patch_nop_anti_debug_bypassed}',
  'pwn-heap-race-condition': 'FLAG{heap_overflow_uaf_zero_day_unlocked}',
  'osint-bunker-recon': 'FLAG{osint_shadow_footprint_recon_complete}',
  'easteregg-desk-usb': 'FLAG{physical_access_usb_ducky_recovered}',
  'stego-ceiling-vent': 'FLAG{hvac_acoustic_sidechannel_exfiltrated}',
};

let errors = 0;

console.log(`[TEST 1] Verifying all ${CTF_CHALLENGES.length} Challenge Flag Hashes...`);
for (const challenge of CTF_CHALLENGES) {
  const plainFlag = KNOWN_FLAGS[challenge.id];
  if (!plainFlag) {
    console.error(`❌ Missing known test flag for challenge ID: ${challenge.id}`);
    errors++;
    continue;
  }

  const isValid = verifyFlagHash(plainFlag, challenge.flagHash);
  if (!isValid) {
    console.error(`❌ Hash verification failed for ${challenge.id}`);
    errors++;
  } else {
    console.log(`  ✔ [${challenge.difficulty}] ${challenge.id} -> Hash verified`);
  }
}

// 2. Test Engine Flag Submission, Scoring, and Duplicate Protection
console.log('\n[TEST 2] Testing Submission & Duplicate Prevention...');
ctfEngine.resetProgress();

const testChal = CTF_CHALLENGES[0];
const wrongRes = ctfEngine.submitFlag(testChal.id, 'FLAG{invalid_guess}');
if (wrongRes.success !== false) {
  console.error('❌ Wrong flag was incorrectly accepted!');
  errors++;
} else {
  console.log('  ✔ Invalid flag correctly rejected.');
}

// Unlock hint first to test penalty
ctfEngine.unlockHint(testChal.id, 0);
const hintCost = testChal.hints[0].cost;

const validRes = ctfEngine.submitFlag(testChal.id, KNOWN_FLAGS[testChal.id]);
if (!validRes.success || validRes.pointsAwarded !== testChal.points - hintCost) {
  console.error(`❌ Valid flag scoring failure: expected ${testChal.points - hintCost}, got ${validRes.pointsAwarded}`);
  errors++;
} else {
  console.log(`  ✔ Valid flag accepted with hint deduction: +${validRes.pointsAwarded} pts (Base: ${testChal.points}, Penalty: -${hintCost})`);
}

// Duplicate submission test
const dupRes = ctfEngine.submitFlag(testChal.id, KNOWN_FLAGS[testChal.id]);
if (dupRes.success !== false || !dupRes.duplicate) {
  console.error('❌ Duplicate flag was not flagged as duplicate!');
  errors++;
} else {
  console.log('  ✔ Duplicate submission blocked correctly without extra points.');
}

// 3. Test Badges and State Progression
console.log('\n[TEST 3] Testing Badges & Score State...');
const state = ctfEngine.getState();
if (state.score !== validRes.pointsAwarded) {
  console.error(`❌ State score mismatch: expected ${validRes.pointsAwarded}, got ${state.score}`);
  errors++;
} else {
  console.log(`  ✔ State score accurate: ${state.score} pts`);
}

if (!state.badges.includes('first_blood') || !state.badges.includes('crypto_breaker')) {
  console.error('❌ Expected badges missing:', state.badges);
  errors++;
} else {
  console.log(`  ✔ Badges correctly unlocked: ${state.badges.join(', ')}`);
}

console.log('\n========================================');
if (errors === 0) {
  console.log('✅ ALL CTF AUTOMATED TESTS PASSED (0 ERRORS)');
} else {
  console.error(`❌ TEST FAILED WITH ${errors} ERRORS`);
  process.exit(1);
}
console.log('========================================');
