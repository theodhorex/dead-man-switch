module dead_mans_switch::dead_mans_switch;

use sui::clock::Clock;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use sui::event;
use std::string::String;

const ENotOwner: u64 = 0;
const EDeadlineNotReached: u64 = 1;
const ESwitchNotActive: u64 = 2;
const ESwitchAlreadyTriggered: u64 = 3;
const EInvalidTimerDays: u64 = 4;
const EInsufficientDeposit: u64 = 5;
const EAlreadyDisarmed: u64 = 6;

const VALID_TIMER_3: u64 = 3;
const VALID_TIMER_7: u64 = 7;
const VALID_TIMER_14: u64 = 14;
const VALID_TIMER_30: u64 = 30;

const MS_PER_DAY: u64 = 86_400_000;
const MIN_DEPOSIT_MIST: u64 = 100_000_000;

public struct DeadMansSwitch has key, store {
    id: UID,
    owner: address,
    beneficiary: address,
    character_name: String,
    last_message: String,
    timer_days: u64,
    deadline_ms: u64,
    last_checkin_ms: u64,
    balance: Balance<SUI>,
    is_active: bool,
    is_triggered: bool,
}

public struct SwitchCreated has copy, drop {
    switch_id: address,
    owner: address,
    beneficiary: address,
    timer_days: u64,
    deposit_amount: u64,
    character_name: String,
}

public struct CheckIn has copy, drop {
    switch_id: address,
    owner: address,
    timestamp: u64,
}

public struct SwitchTriggered has copy, drop {
    switch_id: address,
    owner: address,
    beneficiary: address,
    amount: u64,
    character_name: String,
    last_message: String,
    timestamp: u64,
}

public struct SwitchDisarmed has copy, drop {
    switch_id: address,
    owner: address,
    amount_returned: u64,
}

fun is_valid_timer(timer_days: u64): bool {
    timer_days == VALID_TIMER_3 || timer_days == VALID_TIMER_7 || timer_days == VALID_TIMER_14 || timer_days == VALID_TIMER_30
}

fun init(_ctx: &mut TxContext) {
}

#[allow(lint(self_transfer))]
public fun create_switch(
    beneficiary: address,
    timer_days: u64,
    mut deposit: Coin<SUI>,
    deposit_amount: u64,
    character_name: vector<u8>,
    last_message: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(is_valid_timer(timer_days), EInvalidTimerDays);
    assert!(deposit_amount >= MIN_DEPOSIT_MIST, EInsufficientDeposit);
    assert!(coin::value(&deposit) >= deposit_amount, EInsufficientDeposit);

    let now_ms = clock.timestamp_ms();
    let deposit_coin = coin::split(&mut deposit, deposit_amount, ctx);
    transfer::public_transfer(deposit, ctx.sender());
    let deposit_balance = coin::into_balance(deposit_coin);

    let switch = DeadMansSwitch {
        id: object::new(ctx),
        owner: ctx.sender(),
        beneficiary,
        character_name: std::string::utf8(character_name),
        last_message: std::string::utf8(last_message),
        timer_days,
        deadline_ms: now_ms + (timer_days * MS_PER_DAY),
        last_checkin_ms: now_ms,
        balance: deposit_balance,
        is_active: true,
        is_triggered: false,
    };

    let switch_id = object::uid_to_address(&switch.id);
    let owner = switch.owner;
    let char_name = switch.character_name;

    event::emit(SwitchCreated {
        switch_id,
        owner,
        beneficiary,
        timer_days,
        deposit_amount,
        character_name: char_name,
    });

    transfer::share_object(switch);
}

public fun check_in(
    switch: &mut DeadMansSwitch,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(ctx.sender() == switch.owner, ENotOwner);
    assert!(switch.is_active, ESwitchNotActive);
    assert!(!switch.is_triggered, ESwitchAlreadyTriggered);

    let now_ms = clock.timestamp_ms();
    switch.last_checkin_ms = now_ms;
    switch.deadline_ms = now_ms + (switch.timer_days * MS_PER_DAY);

    event::emit(CheckIn {
        switch_id: object::uid_to_address(&switch.id),
        owner: switch.owner,
        timestamp: now_ms,
    });
}

public fun trigger_switch(
    switch: &mut DeadMansSwitch,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(switch.is_active, ESwitchNotActive);
    assert!(!switch.is_triggered, ESwitchAlreadyTriggered);
    assert!(clock.timestamp_ms() >= switch.deadline_ms, EDeadlineNotReached);

    let now_ms = clock.timestamp_ms();
    let amount = balance::value(&switch.balance);

    let payout = coin::from_balance(
        balance::withdraw_all(&mut switch.balance),
        ctx
    );

    transfer::public_transfer(payout, switch.beneficiary);

    switch.is_triggered = true;
    switch.is_active = false;

    event::emit(SwitchTriggered {
        switch_id: object::uid_to_address(&switch.id),
        owner: switch.owner,
        beneficiary: switch.beneficiary,
        amount,
        character_name: switch.character_name,
        last_message: switch.last_message,
        timestamp: now_ms,
    });
}

public fun withdraw(
    switch: &mut DeadMansSwitch,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(ctx.sender() == switch.owner, ENotOwner);
    assert!(switch.is_active, EAlreadyDisarmed);
    assert!(!switch.is_triggered, ESwitchAlreadyTriggered);

    let amount = balance::value(&switch.balance);
    let refund = coin::from_balance(
        balance::withdraw_all(&mut switch.balance),
        ctx
    );

    transfer::public_transfer(refund, switch.owner);
    switch.is_active = false;

    let _ = clock.timestamp_ms();

    event::emit(SwitchDisarmed {
        switch_id: object::uid_to_address(&switch.id),
        owner: switch.owner,
        amount_returned: amount,
    });
}

public fun owner(switch: &DeadMansSwitch): address { switch.owner }
public fun beneficiary(switch: &DeadMansSwitch): address { switch.beneficiary }
public fun timer_days(switch: &DeadMansSwitch): u64 { switch.timer_days }
public fun last_checkin_ms(switch: &DeadMansSwitch): u64 { switch.last_checkin_ms }
public fun deadline_ms(switch: &DeadMansSwitch): u64 { switch.deadline_ms }
public fun deposit_amount(switch: &DeadMansSwitch): u64 { balance::value(&switch.balance) }
public fun character_name(switch: &DeadMansSwitch): String { switch.character_name }
public fun last_message(switch: &DeadMansSwitch): String { switch.last_message }
public fun is_active(switch: &DeadMansSwitch): bool { switch.is_active }
public fun is_triggered(switch: &DeadMansSwitch): bool { switch.is_triggered }

public fun status(switch: &DeadMansSwitch): String {
    if (switch.is_triggered) {
        std::string::utf8(b"TRIGGERED")
    } else if (switch.is_active) {
        std::string::utf8(b"ARMED")
    } else {
        std::string::utf8(b"DISARMED")
    }
}

public fun can_trigger(switch: &DeadMansSwitch, clock: &Clock): bool {
    switch.is_active
        && !switch.is_triggered
        && clock.timestamp_ms() >= switch.deadline_ms
}

