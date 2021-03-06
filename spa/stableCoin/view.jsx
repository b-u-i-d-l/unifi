var StableCoin = React.createClass({
    requiredScripts: [
        'spa/banner.jsx',
        'spa/loader.jsx',
        'spa/grimoire/grimuSD.jsx'
    ],
    requiredModules: [
        'spa/dappMenu'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/update': this.controller.loadData,
            'ethereum/ping': this.onPing,
            'success/message': this.openSuccessMessage
        }
    },
    onPing() {
        this.state && this.state.selectedPair && this.controller.checkApprove(this.state.selectedPair);
        this.state && this.state.selectedFarmPair && this.controller.checkApprove(this.state.selectedTokenInPairs);
        this.state && this.state.selectedFarmPair && this.controller.checkApprove(this.state.selectedFarmPair, true);
    },
    componentDidMount() {
        this.oldStableCoin = this.props.oldStableCoin || window.consumeAddressBarParam("useOldStableCoin") !== undefined
        this.controller.loadData();
    },
    componentWillUnmount() {
        delete this.oldStableCoin;
        this.economicDataInterval && window.clearInterval(this.economicDataInterval);
        delete this.economicDataInterval;
    },
    onActionChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var value = e.currentTarget.value;
        var _this = this;
        _this.setState({ myBalance: null, burnValue: null }, function () {
            value === 'Burn' && _this.controller.getMyBalance().then(function (myBalance) {
                _this.setState({ myBalance });
            });
        });
    },
    onTokenInPairsChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        this.setState({ selectedTokenInPairs: this.state.tokensInPairs[e.currentTarget.value], token0Approved: null, token1Approved: null }, function () {
            _this.controller.checkApprove(_this.state.selectedTokenInPairs);
            var input = $(_this.domRoot).children().find('input[data-token="selectedTokenInPairs"]')[0];
            input.dataset.value = window.toDecimals(input.value, _this.state.selectedTokenInPairs.decimals);
            _this.controller.calculateEarnByPumpData(_this.state.selectedTokenInPairs, _this.state.selectedFarmPair, input.dataset.value).then(function (earnByPumpData) {
                _this.controller.checkApprove(_this.state.selectedTokenInPairs);
                _this.setState({ earnByPumpData });
                _this.onType({
                    currentTarget : $(_this.domRoot).children().find('input[data-token="selectedTokenInPairs"]')[0]
                });
            });
        });
    },
    onPairChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        e.currentTarget.dataset.target === 'classic' && this.setState({ selectedPair: this.state.pairs[e.currentTarget.value], token0Approved: null, token1Approved: null }, function () {
            try {
                $(_this.domRoot).children().find('input[data-token="0"]')[0].value = '0.00';
                $(_this.domRoot).children().find('input[data-token="0"]')[0].dataset.value = '0';
                $(_this.domRoot).children().find('input[data-token="1"]')[0].value = '0.00';
                $(_this.domRoot).children().find('input[data-token="1"]')[0].dataset.value = '0';
            } catch (e) {
            }
            _this.controller.checkApprove(_this.state.selectedPair);
            var stableCoin = $(_this.domRoot).children().find('input[data-token="stableCoin"]')[0];
            stableCoin && _this.onType({
                currentTarget: stableCoin
            });
        });
        e.currentTarget.dataset.target === 'farm' && this.setState({ selectedFarmPair: this.state.pairs[e.currentTarget.value] }, function () {
            var input = $(_this.domRoot).children().find('input[data-token="selectedTokenInPairs"]')[0];
            if (input) {
                var value = input.value;
                _this.controller.calculateEarnByPumpData(_this.state.selectedTokenInPairs, _this.state.selectedFarmPair, window.toDecimals(value, _this.state.selectedTokenInPairs.decimals)).then(function (earnByPumpData) {
                    _this.setState({ earnByPumpData });
                    _this.onType({
                        currentTarget : $(_this.domRoot).children().find('input[data-token="selectedTokenInPairs"]')[0]
                    });
                });
                return;
            }
            $(_this.domRoot).children().find('input[data-token="farm0"]')[0].value = '0.00';
            $(_this.domRoot).children().find('input[data-token="farm0"]')[0].dataset.value = '0';
            $(_this.domRoot).children().find('input[data-token="farm1"]')[0].value = '0.00';
            $(_this.domRoot).children().find('input[data-token="farm1"]')[0].dataset.value = '0';
            _this.controller.checkApprove(_this.state.selectedFarmPair, true);
            _this.controller.calculateFarmDumpValue(_this.state.selectedFarmPair, "0", window.toDecimals("1", window.stableCoin.decimals)).then(function (selectedFarmPairTokenSinglePrice) {
                _this.setState({ selectedFarmPairToken: _this.state.selectedFarmPair.token0 });
                _this.setState({ selectedFarmPairTokenSinglePrice });
                _this.farmDumpRange && _this.onFarmDumpSliderChange({
                    currentTarget: _this.farmDumpRange
                });
            });
        });
    },
    onDumpPairChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        var token = e.currentTarget.value;
        _this.controller.calculateFarmDumpValue(_this.state.selectedFarmPair, token, window.toDecimals("1", window.stableCoin.decimals)).then(function (selectedFarmPairTokenSinglePrice) {
            _this.setState({ selectedFarmPairToken: _this.state.selectedFarmPair["token" + token] });
            _this.setState({ selectedFarmPairTokenSinglePrice });
            _this.farmDumpRange && _this.onFarmDumpSliderChange({
                currentTarget: _this.farmDumpRange
            });
        });
    },
    onType(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        var target = e.currentTarget;
        _this.onTypeTimeout && window.clearTimeout(_this.onTypeTimeout);
        _this.onTypeTimeout = setTimeout(function () {
            var decimals = target.dataset.token === 'stableCoin' ? window.stableCoin.decimals : target.dataset.token === 'selectedTokenInPairs' ? _this.state.selectedTokenInPairs.decimals : (target.dataset.token.indexOf('farm') === -1 ? _this.state.selectedPair : _this.state.selectedFarmPair)["token" + target.dataset.token.split('farm').join('')].decimals;
            target.dataset.value = window.toDecimals(target.value, decimals);
            (target.dataset.token === '0' || target.dataset.token === '1') && _this.controller.calculateOtherPair(_this.state.selectedPair, target.dataset.token, target.value, _this.actionSelect.value).then(result => {
                var otherId = (target.dataset.token === "0" ? "1" : "0");
                var otherTarget = $(_this.domRoot).children().find('input[data-token="' + otherId + '"]')[0];
                otherTarget.dataset.value = result;
                otherTarget.value = window.formatMoney(window.fromDecimals(result, _this.state.selectedPair["token" + otherId].decimals, true), 6);
                _this.refreshStableCoinOutput();
            });
            target.dataset.token === 'stableCoin' && _this.controller.calculateBurnValue(_this.state.selectedPair, target.dataset.value).then(function (burnValue) {
                _this.setState({ burnValue });
            });
            target.dataset.token === 'selectedTokenInPairs' && _this.controller.calculateEarnByPumpData(_this.state.selectedTokenInPairs, _this.state.selectedFarmPair, target.dataset.value).then(function (earnByPumpData) {
                _this.setState({ earnByPumpData });
            });
            (target.dataset.token === 'farm0' || target.dataset.token === 'farm1') && _this.controller.calculateOtherPair(_this.state.selectedFarmPair, target.dataset.token.split('farm').join(''), target.value, _this.actionSelect.value).then(result => {
                var otherId = (target.dataset.token === "farm0" ? "1" : "0");
                var otherTarget = $(_this.domRoot).children().find('input[data-token="farm' + otherId + '"]')[0];
                otherTarget.dataset.value = result;
                otherTarget.value = window.formatMoney(window.fromDecimals(result, _this.state.selectedFarmPair["token" + otherId].decimals, true), 6);
                _this.refreshStableCoinOutput("farm", _this.farmStableCoinOutput);
            });
        }, window.context.typeTimeout);
    },
    refreshStableCoinOutput(prefix, ref) {
        prefix = prefix || "";
        var token0Value = $(this.domRoot).children().find(`input[data-token="${prefix}0"]`)[0].dataset.value;
        var token1Value = $(this.domRoot).children().find(`input[data-token="${prefix}1"]`)[0].dataset.value;
        var result = this.controller.getStableCoinOutput(this.state.selectedPair, token0Value, token1Value);
        result = window.formatMoney(window.fromDecimals(result, window.stableCoin.decimals, true), 0);
        (ref || this.stableCoinOutput).innerHTML = result;
        this.farmStableCoinSwap && (this.farmStableCoinSwap.innerHTML = result);
        result = result.split(',').join('');
        this.farmDumpRange && (this.farmDumpRange.max = result);
        result = window.formatMoney(parseInt(result) * 0.15).split(',').join('');
        this.farmDumpRange && (this.farmDumpRange.value = result);
        this.farmDumpRange && this.onFarmDumpSliderChange({
            currentTarget: this.farmDumpRange
        });
    },
    onFarmDumpSliderChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.farmStableCoinSwap.innerHTML = e.currentTarget.value;
        var _this = this;
        var token = _this.dumpPairSelection.value;
        var dumpFinalStable = window.formatMoney(parseFloat(e.currentTarget.max) - parseFloat(e.currentTarget.value));
        var currentTarget = e.currentTarget;
        _this.onTypeTimeout && window.clearTimeout(_this.onTypeTimeout);
        _this.onTypeTimeout = setTimeout(function () {
            _this.controller.calculateFarmDumpValue(_this.state.selectedFarmPair, token, window.toDecimals(currentTarget.value, window.stableCoin.decimals)).then(function (selectedFarmPairTokenPrice) {
                _this.setState({ selectedFarmPairTokenPrice, dumpFinalStable });
                _this.controller.setDumpPricesInDollars(
                    _this.state.selectedFarmPair,
                    $(_this.domRoot).children().find('input[data-token="farm0"]')[0].dataset.value,
                    $(_this.domRoot).children().find('input[data-token="farm1"]')[0].dataset.value,
                    dumpFinalStable,
                    _this.state.selectedFarmPair['token' + token],
                    selectedFarmPairTokenPrice
                );
            });
        }, 230);
    },
    farmDumpRangeMax(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.farmDumpRange.value = this.farmDumpRange.max;
        this.onFarmDumpSliderChange({
            currentTarget: this.farmDumpRange
        });
    },
    doAction(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if (e.currentTarget.className.toLowerCase().indexOf("disabled") !== -1 || (this.state && ((this.state.approving !== undefined && this.state.approving !== null) || (this.state.performing !== undefined && this.state.performing !== null)))) {
            return;
        }
        var performing = e.currentTarget.dataset.action;
        var args = [];
        if (performing === 'Mint') {
            args = [
                this.state.selectedPair,
                $(this.domRoot).children().find('input[data-token="0"]')[0].dataset.value,
                $(this.domRoot).children().find('input[data-token="1"]')[0].dataset.value
            ];
        }
        if (performing === 'Burn') {
            args = [
                this.state.selectedPair,
                $(this.domRoot).children().find('input[data-token="stableCoin"]')[0].dataset.value
            ];
        }
        if (performing === 'EarnByPump') {
            args = [
                this.state.selectedTokenInPairs,
                this.state.selectedFarmPair,
                $(this.domRoot).children().find('input[data-token="selectedTokenInPairs"]')[0].dataset.value
            ];
        }
        if (performing === 'EarnByDump') {
            args = [
                this.state.selectedFarmPair,
                $(this.domRoot).children().find('input[data-token="farm0"]')[0].dataset.value,
                $(this.domRoot).children().find('input[data-token="farm1"]')[0].dataset.value,
                this.dumpPairSelection.value,
                window.toDecimals(this.farmDumpRange.value, window.stableCoin.decimals)
            ];
        }
        var _this = this;
        _this.setState({ approving: null, performing: null }, function () {
            var end = function end(errorMessage) {
                var message = errorMessage && (errorMessage.message || errorMessage);
                if (message && message.toLowerCase().indexOf('user denied') !== -1) {
                    message = undefined;
                }
                _this.setState({ approving: null, performing: null }, function () {
                    message && setTimeout(function () {
                        alert(message);
                    });
                });
            };
            _this.setState({ performing }, function () {
                _this.controller["perform" + performing].apply(this, args).catch(end).finally(end);
            });
        });
    },
    approve(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        if (e.currentTarget.className.toLowerCase().indexOf("disabled") !== -1 || (this.state && ((this.state.approving !== undefined && this.state.approving !== null) || (this.state.performing !== undefined && this.state.performing !== null)))) {
            return;
        }
        this.controller.approve(this.state.selectedPair, e.currentTarget.dataset.token);
    },
    rebalance(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.controller.rebalance();
    },
    renderAvailableToMint() {
        if (!this.state || !this.state.availableToMint) {
            return;
        }
        if (parseInt(this.state.availableToMint) + parseInt(this.state.totalSupply) === 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff) {
            return;
        }
        return (
            <section>
                <h4>Mintable:</h4>
                <span>{window.fromDecimals(this.state.availableToMint, window.stableCoin.decimals)} {window.stableCoin.symbol}</span>
            </section>
        );
    },
    toggleTotalCoins(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.setState({ toggleTotalCoins: this.state && this.state.toggleTotalCoins ? null : true });
    },
    max(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        var token = e.currentTarget.dataset.token;
        (token === '0' || token === '1') && this.controller.getBalance(this.state.selectedPair).then(function () {
            var input = $(_this.domRoot).children().find(`input[data-token="${token}"]`)[0];
            var max = _this.state.selectedPair["token" + token].balance;
            input.value = window.fromDecimals(max, _this.state.selectedPair["token" + token].decimals, true);
            _this.onType({
                currentTarget: input
            });
        });
        token === 'stableCoin' && this.controller.getMyBalance().then(function (myBalance) {
            _this.setState({ myBalance }, function () {
                var input = $(_this.domRoot).children().find(`input[data-token="${token}"]`)[0];
                input.value = window.fromDecimals(myBalance, window.stableCoin.decimals, true);
                _this.onType({
                    currentTarget: input
                });
            });
        });
        token === 'selectedTokenInPairs' && this.controller.getBalance(this.state.selectedTokenInPairs).then(function () {
            var input = $(_this.domRoot).children().find(`input[data-token="${token}"]`)[0];
            var max = _this.state.selectedTokenInPairs.balance;
            input.value = window.fromDecimals(max, _this.state.selectedTokenInPairs.decimals, true);
            _this.onType({
                currentTarget: input
            });
        });
        (token === 'farm0' || token === 'farm1') && this.controller.getBalance(this.state.selectedFarmPair).then(function () {
            var input = $(_this.domRoot).children().find(`input[data-token="${token}"]`)[0];
            var max = _this.state.selectedFarmPair["token" + token.split('farm').join('')].balance;
            input.value = window.fromDecimals(max, _this.state.selectedFarmPair["token" + token.split('farm').join('')].decimals, true);
            _this.onType({
                currentTarget: input
            });
        });
    },
    rebalanceByDebt(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.controller.rebalanceByDebt(this.rebalanceByDebtInput.value);
    },
    rebalanceByDebtInputChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        var target = e.currentTarget;
        _this.onTypeTimeout && window.clearTimeout(_this.onTypeTimeout);
        _this.onTypeTimeout = setTimeout(function () {
            _this.controller.calculateRebalanceByDebtReward(target.value).then(function (result) {
                _this.debtReward.innerHTML = window.fromDecimals(result, window.dfo.decimals);
            });
        }, window.context.typeTimeout);
    },
    toggleGrimoire(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.setState({ grimoire: !(this.state && this.state.grimoire) });
    },
    onSwapFarmTokenCheck(e) {
        var token = e.currentTarget.dataset.target;
        var currentTarget = this["swapFarmToken" + token];
        currentTarget.value = '0';
        currentTarget.dataset.value = '0';
        currentTarget.disabled = !e.currentTarget.checked;
        this['swapFarmToken' + token + 'Output'].innerHTML = '0.00';
        this.onFarmDumpChange({ currentTarget });
    },
    onFarmDumpChange(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        var element = e.currentTarget;
        var token = element.dataset.target;
        _this['swapFarmToken' + token + 'Output'].innerHTML = '0.00';
        _this.onTypeTimeout && window.clearTimeout(_this.onTypeTimeout);
        _this.onTypeTimeout = setTimeout(function () {
            var value = element.value;
            value = window.toDecimals(value, window.stableCoin.decimals);
            element.dataset.value = value;
            _this.controller.calculateFarmDumpValue(_this.state.selectedFarmPair, token, value).then(function (farmDumpValue) {
                _this['swapFarmToken' + token + 'Output'].innerHTML = window.fromDecimals(farmDumpValue, _this.state.selectedFarmPair['token' + token].decimals, true);
            });
        }, window.context.typeTimeout);
    },
    closeSuccessMessage(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.successMessageCloseTimeout && window.clearTimeout(this.successMessageCloseTimeout);
        this.setState({ successMessage: null });
    },
    openSuccessMessage(successMessage) {
        this.closeSuccessMessage();
        var _this = this;
        _this.setState({ successMessage }, function () {
            _this.successMessageCloseTimeout = setTimeout(function () {
                _this.closeSuccessMessage();
            }, 4000);
        });
    },
    renderMint() {
        return (
            <section className="UniTierQuantity">
                <label className="UniActiveQuantityTier">
                    <input data-token="0" onKeyUp={this.onType} />
                    <img src={this.state.selectedPair.token0.logo} />
                    <p>{this.state.selectedPair.token0.symbol}</p>
                    {window.walletAddress && <h6><a href="javascript:;" data-token="0" onClick={this.max}>Max</a> Balance: {window.fromDecimals(this.state.selectedPair.token0.balance, this.state.selectedPair.token0.decimals)} {this.state.selectedPair.token0.symbol}</h6>}
                </label>
                <h5>And</h5>
                <label className="UniDisactiveQuantityTier">
                    <input data-token="1" onKeyUp={this.onType} />
                    <img src={this.state.selectedPair.token1.logo} />
                    <p>{this.state.selectedPair.token1.symbol}</p>
                    {window.walletAddress && <h6><a href="javascript:;" data-token="1" onClick={this.max}>Max</a> Balance: {window.fromDecimals(this.state.selectedPair.token1.balance, this.state.selectedPair.token1.decimals)} {this.state.selectedPair.token1.symbol}</h6>}
                </label>
                <h2>for <b ref={ref => this.stableCoinOutput = ref}>0</b>{'\u00a0'}{window.stableCoin.symbol}</h2>
                {window.walletAddress && this.state && this.state.myBalance && this.actionSelect && this.actionSelect.value === 'Burn' && <h6>Balance: <b>{window.fromDecimals(this.state.myBalance, window.stableCoin.decimals)}</b>{'\u00a0'}{window.stableCoin.symbol}</h6>}
                {window.walletAddress && (!this.state.token0Approved || this.state.token1Approved) && this.state.approving !== '0' && this.state.approving !== '1' && <a className="approveBTN" href="javascript:;" onClick={this.approve} data-token="0" className={this.state.token0Approved ? "approveBTN Disabled" : "approveBTN"}>Approve {this.state.selectedPair.token0.symbol}</a>}
                {window.walletAddress && this.state.token0Approved && !this.state.token1Approved && this.state.approving !== '0' && this.state.approving !== '1' && <a className="approveBTN" href="javascript:;" onClick={this.approve} data-token="1">Approve {this.state.selectedPair.token1.symbol}</a>}
                {(this.state.approving === '0' || this.state.approving === '1') && <Loader loaderClass="loaderMini" loaderImg={window.resolveImageURL("loader4", "gif")} />}
                {window.walletAddress && this.state.performing !== 'Mint' && <a href="javascript:;" data-action="Mint" onClick={this.doAction} className={!this.state.token0Approved || !this.state.token1Approved ? "StableITBTN Disabled" : "StableITBTN"}>GO</a>}
                {this.state.performing === 'Mint' && <Loader loaderClass="loaderMini" loaderImg={window.resolveImageURL("loader3", "gif")} />}
            </section>
        );
    },
    renderBurn() {
        return (
            <section className="UniTierQuantity">
                <label className="UniDisactiveQuantityTier">
                    <input data-token="stableCoin" onKeyUp={this.onType} />
                    <img src={window.stableCoin.logo} />
                    <p>{window.stableCoin.symbol}</p>
                    {window.walletAddress && <h6><a href="javascript:;" data-token="stableCoin" onClick={this.max}>Max</a> Balance: {window.fromDecimals(this.state.myBalance, window.stableCoin.decimals)} {window.stableCoin.symbol}</h6>}
                </label>
                <h2>for</h2>
                <label className="UniActiveQuantityTier UniActiveQuantityTierBurn">
                    <span>{(this.state && this.state.burnValue && window.fromDecimals(this.state.burnValue.token0, this.state.selectedPair.token0.decimals, true)) || '0.00'}</span>
                    <img src={this.state.selectedPair.token0.logo} />
                    <p>{this.state.selectedPair.token0.symbol}</p>
                </label>
                <h5>And</h5>
                <label className="UniDisactiveQuantityTier UniActiveQuantityTierBurn">
                    <span>{(this.state && this.state.burnValue && window.fromDecimals(this.state.burnValue.token1, this.state.selectedPair.token1.decimals, true)) || '0.00'}</span>
                    <img src={this.state.selectedPair.token1.logo} />
                    <p>{this.state.selectedPair.token1.symbol}</p>
                </label>
                <br />
                {window.walletAddress && this.state.performing !== 'Burn' && <a href="javascript:;" data-action="Burn" onClick={this.doAction} className="StableITBTN">GO</a>}
                {this.state.performing === 'Burn' && <Loader loaderClass="loaderMini" loaderImg={window.resolveImageURL("loader3", "gif")} />}
            </section>
        );
    },
    renderPumpDumpBanner() {
        if (window.stableCoin && window.stableCoin.name && window.stableCoin.symbol) {
            return (<section className="StableCoinTitle StableCoinTitleALWAYS">
                <section className="StableCoinTitleIntern">
                    <img src="assets/img/farmer.png"></img>
                    <article>
                        <h2>{window.stableCoin.symbol} Arbitrage Farming</h2>
                        <h6><b>It’s time to farm stablecoins by stabilizing {window.stableCoin.symbol}!</b><br />You can see this section if {window.stableCoin.symbol} price is  greater or less to $1.<br></br><b>What {window.stableCoin.symbol} Arbitrage Farming is about?</b><br></br><br></br> If {window.stableCoin.symbol} is grater than $1, you can stabilize it and earn in a single transaction by 1- Minting uSD, by adding to a stablecoin tier; 2- Swapping your minted uSD for another stablecoin; And earning extra stablecoins from the difference. <br></br><br></br>If {window.stableCoin.symbol} is less than $1, you can stabilize it and earn in a single transaction by 1- Swapping a stablecoin for uSD; 2- Burning the excess uSD for another stablecoin; And 3- ultimately ending up with same $ amount you started with plus extra stablecoins <b></b><a href={window.getNetworkElement("etherscanURL") + "address/" + window.stableFarming.options.address} target="_blank">Contract</a></h6>
                    </article>
                </section>
            </section>);
        }
        return undefined;
    },
    renderDump() {
        return (
            <section>
                {this.renderPumpDumpBanner()}
                <section className="UniBox">
                    <section className="UniTitle">
                        <label>
                            <p>Farm $ by Mint using</p>
                            <select data-target="farm" onChange={this.onPairChange}>
                                {this.state && this.state.pairs && this.state.pairs.map((it) => {
                                    if (it.disabled || !it.token0.pairWithStable || !it.token1.pairWithStable) {
                                        return;
                                    }
                                    return (<option key={it.name} value={it.index}>
                                        {it.name}
                                    </option>);
                                })}
                            </select>
                        </label>
                    </section>
                    <section className="UniTierQuantity">
                        <label className="UniActiveQuantityTier">
                            <input data-token="farm0" onKeyUp={this.onType} />
                            <img src={this.state.selectedFarmPair.token0.logo} />
                            <p>{this.state.selectedFarmPair.token0.symbol}</p>
                            {window.walletAddress && <h6><a href="javascript:;" data-token="farm0" onClick={this.max}>Max</a> Balance: {window.fromDecimals(this.state.selectedFarmPair.token0.balance, this.state.selectedFarmPair.token0.decimals)} {this.state.selectedFarmPair.token0.symbol}</h6>}
                        </label>
                        <h5>And</h5>
                        <label className="UniDisactiveQuantityTier">
                            <input data-token="farm1" onKeyUp={this.onType} />
                            <img src={this.state.selectedFarmPair.token1.logo} />
                            <p>{this.state.selectedFarmPair.token1.symbol}</p>
                            {window.walletAddress && <h6><a href="javascript:;" data-token="farm1" onClick={this.max}>Max</a> Balance: {window.fromDecimals(this.state.selectedFarmPair.token1.balance, this.state.selectedFarmPair.token1.decimals)} {this.state.selectedFarmPair.token1.symbol}</h6>}
                        </label>
                        <h2>for <b ref={ref => this.farmStableCoinOutput = ref}>0</b>{'\u00a0'}{window.stableCoin.symbol}</h2>
                    </section>
                </section>
                <section className="UniSideBox">
                    <h2>Then Swap <b ref={ref => this.farmStableCoinSwap = ref}>0</b>{'\u00a0'}{window.stableCoin.symbol}</h2>
                    <input ref={ref => this.farmDumpRange = ref} type="range" min="0" max="0" step="0.5" onChange={this.onFarmDumpSliderChange} />
                    <a className="SideFarmMaxBTN" href="javascript:;" onClick={this.farmDumpRangeMax}>Max</a>
                    <br />
                    <h2>for</h2>
                    <select className="FARMSPECSELECT" ref={ref => this.dumpPairSelection = ref} onChange={this.onDumpPairChange}>
                        <option value="0">{this.state.selectedFarmPair.token0.symbol}</option>
                        <option value="1">{this.state.selectedFarmPair.token1.symbol}</option>
                    </select>
                    {false && <label className="UniActiveQuantityTier">
                        <img src={window.stableCoin.logo} />
                        <p>{window.stableCoin.symbol}</p>
                        <img src={this.state.selectedFarmPairToken.logo} />
                        <p>{this.state.selectedFarmPairToken.symbol}</p>
                        {this.state.selectedFarmPairTokenSinglePrice && <h6>1 {window.stableCoin.symbol} = {window.fromDecimals(this.state.selectedFarmPairTokenSinglePrice, this.state.selectedFarmPairToken.decimals)} {this.state.selectedFarmPairToken.symbol}</h6>}
                    </label>}
                    {this.state.farmDumpPay && <label className="UniActiveQuantityTier">
                        <h6>You will pay:</h6>
                        $ {this.state.farmDumpPay}
                    </label>}
                    <label className="UniActiveQuantityTier">
                        <h6>You will receive:</h6>
                        {this.state.dumpFinalStable && this.state.dumpFinalStable !== '0' && <span>{this.state.dumpFinalStable} {window.stableCoin.symbol}</span>}
                        <br />
                        {this.state.selectedFarmPairTokenPrice && <span>{window.fromDecimals(this.state.selectedFarmPairTokenPrice, this.state.selectedFarmPairToken.decimals)} {this.state.selectedFarmPairToken.symbol}</span>}
                    </label>
                    {this.state.farmDumpDifference && <label className={"UniActiveQuantityTier " + (this.state.farmDumpDifference.indexOf("-") === -1 ? "WOOOOOOOOOOOOW" : "NOOOOOOOOOOOOO")}>
                        <h6 className={(this.state.farmDumpDifference.indexOf("-") === -1 ? "WOOOOOOOOOOOOW" : "NOOOOOOOOOOOOO")}>Arbitrage Earns:</h6>
                        <b>$ {this.state.farmDumpDifference}</b>
                    </label>}
                    <label className="UniActiveQuantityTier">
                        {window.walletAddress && (!this.state.farmToken0Approved || this.state.farmToken1Approved) && this.state.approving !== 'farm0' && this.state.approving !== 'farm1' && <a href="javascript:;" onClick={this.approve} data-token="farm0" className={this.state.farmToken0Approved ? "approveBTN Disabled" : "approveBTN"}>Approve {this.state.selectedFarmPair.token0.symbol}</a>}
                        {window.walletAddress && this.state.farmToken0Approved && !this.state.farmToken1Approved && this.state.approving !== 'farm0' && this.state.approving !== 'farm1' && <a className="approveBTN" href="javascript:;" onClick={this.approve} data-token="farm1">Approve {this.state.selectedFarmPair.token1.symbol}</a>}
                        {(this.state.approving === 'farm0' || this.state.approving === 'farm1') && <Loader loaderClass="loaderMini" loaderImg={window.resolveImageURL("loader4", "gif")} />}
                        {window.walletAddress && this.state.performing !== 'EarnByDump' && <a href="javascript:;" data-action="EarnByDump" onClick={this.doAction} className={!this.state.farmToken0Approved || !this.state.farmToken1Approved ? "StableITBTN Disabled" : "StableITBTN"}>GO</a>}
                        {this.state.performing === 'EarnByDump' && <Loader loaderClass="loaderMini" loaderImg={window.resolveImageURL("loader3", "gif")} />}
                    </label>
                </section>
            </section>
        );
    },
    renderPump() {
        if(!this.state.selectedTokenInPairs) {
            return ([<br/>, <Loader loaderClass="loaderRegular" loaderImg={window.resolveImageURL("loader3", "gif")}/>]);
        }
        return (
            <section>
                {this.renderPumpDumpBanner()}
                <section className="UniBox">
                    <section className="UniTierQuantity">
                        <p>Farm $ by swapping uSD from</p>
                        <select className="FARMSPECSELECT" onChange={this.onTokenInPairsChange}>
                            {this.state && this.state.tokensInPairs && Object.values(this.state.tokensInPairs).map(it => <option key={it.address} value={it.address}>{it.symbol}</option>)}
                        </select>
                        <br/>
                        {this.state && this.state.selectedTokenInPairs && <label className="UniDisactiveQuantityTier">
                            <input data-token="selectedTokenInPairs" onKeyUp={this.onType} />
                            <img src={this.state.selectedTokenInPairs.logo} />
                            <p>{this.state.selectedTokenInPairs.symbol}</p>
                            {window.walletAddress && <h6><a href="javascript:;" data-token="selectedTokenInPairs" onClick={this.max}>Max</a> Balance: {window.fromDecimals(this.state.selectedTokenInPairs.balance, this.state.selectedTokenInPairs.decimals)} {this.state.selectedTokenInPairs.symbol}</h6>}
                        </label>}
                        <br/>
                        <label>
                            <p className="BOHBOH">Value in $: {this.state && this.state.earnByPumpData && window.formatMoney(this.state.earnByPumpData.inputInDollars)}. Swap it for {(this.state && this.state.earnByPumpData && window.fromDecimals(this.state.earnByPumpData.output, window.stableCoin.decimals)) || '0'} {window.stableCoin.symbol}, then burn the diff to</p>
                            <br/>
                            <select className="FARMSPECSELECT" data-target="farm" onChange={this.onPairChange}>
                                {this.state && this.state.pairs && this.state.pairs.map((it) => {
                                    if (it.disabled) {
                                        return;
                                    }
                                    return (<option key={it.name} value={it.index}>
                                        {it.name}
                                    </option>);
                                })}
                            </select>
                        </label>
                    </section>
                </section>
                <section className="UniSideBox">
                    <h2>result</h2>
                    <label className="UniActiveQuantityTier">
                        <span>{(this.state && this.state.earnByPumpData && this.state.earnByPumpData.inputInDollars && window.formatMoney(this.state.earnByPumpData.inputInDollars)) || '0.00'}</span>
                        <img src={window.stableCoin.logo} />
                        <p>{window.stableCoin.symbol}</p>
                    </label>
                    {this.state && this.state.selectedFarmPair && <label className="UniActiveQuantityTier">
                        <span>{(this.state && this.state.earnByPumpData && window.fromDecimals(this.state.earnByPumpData.token0Value, this.state.selectedFarmPair.token0.decimals)) || '0.00'}</span>
                        <img src={this.state.selectedFarmPair.token0.logo} />
                        <p>{this.state.selectedFarmPair.token0.symbol}</p>
                    </label>}
                    <h5>And</h5>
                    {this.state && this.state.selectedFarmPair && <label className="UniDisactiveQuantityTier">
                        <span>{(this.state && this.state.earnByPumpData && window.fromDecimals(this.state.earnByPumpData.token1Value, this.state.selectedFarmPair.token1.decimals)) || '0.00'}</span>
                        <img src={this.state.selectedFarmPair.token1.logo} />
                        <p>{this.state.selectedFarmPair.token1.symbol}</p>
                    </label>}
                    {this.state.earnByPumpData && this.state.earnByPumpData.farmPumpDifference && <label className={"UniActiveQuantityTier " + (this.state.earnByPumpData.farmPumpDifference.indexOf("-") === -1 ? "WOOOOOOOOOOOOW" : "NOOOOOOOOOOOOO")}>
                        <h6 className={(this.state.earnByPumpData.farmPumpDifference.indexOf("-") === -1 ? "WOOOOOOOOOOOOW" : "NOOOOOOOOOOOOO")}>Arbitrage Earns:</h6>
                        <b>$ {this.state.earnByPumpData.farmPumpDifference}</b>
                    </label>}
                    <label className="UniActiveQuantityTier">
                        {window.walletAddress && this.state.approving !== 'selectedTokenInPairs' && <a href="javascript:;" onClick={this.approve} data-token="selectedTokenInPairs" className={"approveBTN" + (this.state.selectedTokenInPairsApproved ? " Disabled" : "")}>Approve {this.state.selectedTokenInPairs.symbol}</a>}
                        {this.state && this.state.approving === 'selectedTokenInPairs' && <Loader loaderClass="loaderMini" loaderImg={window.resolveImageURL("loader4", "gif")} />}
                        {window.walletAddress && this.state.performing !== 'EarnByPump' && <a href="javascript:;" data-action="EarnByPump" onClick={this.doAction} className={"StableITBTN" + (!this.state.selectedTokenInPairsApproved ? " Disabled" : "")}>GO</a>}
                        {this.state && this.state.performing === 'EarnByPump' && <Loader loaderClass="loaderMini" loaderImg={window.resolveImageURL("loader3", "gif")} />}
                    </label>
                </section>
            </section>
        );
    },
    render() {
        return (
            <section className="unifiDapp">
                <DappMenu />
                <section className="CallToGrim">
                    <section>
                        <a href="javascript:;" onClick={this.toggleGrimoire}>
                            {this.state && this.state.grimoire && <img src="assets/img/m0.png"></img>}
                            {(!this.state || !this.state.grimoire) && <img src="assets/img/m0.png"></img>}
                        </a>
                    </section>
                </section>
                {window.stableCoin && window.stableCoin.name && window.stableCoin.symbol && <section className="StableCoinTitle">
                    <section className="StableCoinTitleIntern">
                        <img src="assets/img/m4.png"></img>
                        <article>
                            <h2>{window.stableCoin.name.firstLetterToUpperCase()}</h2>
                            <h6><b>{window.stableCoin.symbol} is a Stable Coin based on Uniswap Liquidity Pools</b><br />Here, you can mint {window.stableCoin.symbol} by adding liquidity to whitelisted Uniswap Stable Coin Pools or redeem anytime whitelisted Stable Coins by burning {window.stableCoin.symbol}. | <a href={window.getNetworkElement("etherscanURL") + "token/" + window.stableCoin.address} target="_blank">Etherscan</a> <a href={"https://uniswap.info/token/" + window.stableCoin.address} target="_blank">Uniswap</a></h6>
                        </article>
                    </section>
                </section>}
                {false && this.state && this.state.successMessage && <section className="SuccessMessage">
                    <a href="javascript:;" onClick={this.closeSuccessMessage}>X</a>
                    <p>
                        You have successfully {this.state.successMessage}!
                    </p>
                </section>}
                {this.state && this.state.connectionUnavailable && <section>
                    <h2>You need to connect your wallet to proceed.</h2>
                </section>}
                {(!this.state || (!this.state.selectedPair && !this.state.connectionUnavailable)) && <Loader loaderClass="loaderRegular" loaderImg={window.resolveImageURL("loader3", "gif")} />}
                {this.state && this.state.selectedPair && <section className="UniBox">
                    <section className="UniTitle">
                        <label>
                            <select ref={ref => this.actionSelect = ref} onChange={this.onActionChange}>
                                {!this.oldStableCoin && <option value="Mint">Mint</option>}
                                <option value="Burn">Burn</option>
                            </select>
                            <img className="UniStableManage" src={window.stableCoin.logo}></img>
                            <p><b>{window.stableCoin.symbol}</b></p>
                        </label>
                        <label>
                            <p> by</p>
                            <select data-target="classic" onChange={this.onPairChange}>
                                {this.state && this.state.pairs && this.state.pairs.map((it) => {
                                    if (it.disabled) {
                                        return;
                                    }
                                    return (<option key={it.name} value={it.index}>
                                        {it.name}
                                    </option>);
                                })}
                            </select>
                        </label>
                    </section>
                    {this.actionSelect && this['render' + this.actionSelect.value]()}
                </section>}
                {this.state && this.state.selectedPair && <section className="UniSideBox">
                    {this.state && this.state.priceInDollars && <section className="SideStandard">
                        <h4>1 {window.stableCoin.symbol}: <b>${window.formatMoney(this.state.priceInDollars, 2)}</b></h4>
                    </section>}
                    {this.state && this.state.totalSupply && <section className="SideStandard">
                        <h5>Supply:</h5>
                        <h6>{window.fromDecimals(this.state.totalSupply, window.stableCoin.decimals)} {window.stableCoin.symbol}</h6>
                    </section>}
                    {this.state && this.state.totalCoins && <section className="SideStandard">
                        <h5>Collateral:</h5>
                        <h6><a href="javascript:;" onClick={this.toggleTotalCoins}>{window.fromDecimals(this.state.totalCoins.balanceOf, window.stableCoin.decimals)} S.C.</a></h6>
                        {this.state.toggleTotalCoins && <ul className="SideStableList">
                            {Object.values(this.state.totalCoins.list).map(it => <li key={it.address}>
                                <section>
                                    <span>{window.fromDecimals(it.balanceOf, window.stableCoin.decimals)}</span>
                                    {'\u00a0'}
                                    <span>{it.symbol}</span>
                                </section>
                            </li>)}
                        </ul>}
                    </section>}
                    {this.renderAvailableToMint()}
                    {this.state && this.state.totalCoins && <section className="SideStandard">
                        <h4>Health:</h4>
                        <section className="SideHealthHelp">
                            <section className="SideHealth"><aside style={{ "width": this.state.totalCoins.healthPercentage + "%" }}><span>{this.state.totalCoins.regularPercentage}%</span></aside></section>
                        </section>
                    </section>}
                    {window.walletAddress && this.state && this.state.pairs && this.state.totalCoins && this.state.differences && (parseInt(this.state.totalCoins.regularPercentage) > 103 || parseInt(this.state.totalCoins.regularPercentage) < 97) && <section className="SideDiff">
                        <h4>Rebalance</h4>
                        {parseInt(this.state.totalCoins.regularPercentage) > 103 && <section className="SideRebelanceBro SideCredit">
                            <label>
                                <h5>DFO Credit:</h5>
                                <h6><b>{window.fromDecimals(this.state.differences[0], window.stableCoin.decimals)} {window.stableCoin.symbol}</b></h6>
                            </label>
                            {window.walletAddress && <section>
                                <a href="javascript:;" onClick={this.controller.rebalanceByCredit} className="StableITBTN">Rebalance</a>
                            </section>}
                        </section>}
                        {parseInt(this.state.totalCoins.regularPercentage) < 85 && <section className="SideRebelanceBro SideDebit">
                            <label>
                                <h5>DFO Debt:</h5>
                                <h6><b>{window.fromDecimals(this.state.differences[1], window.stableCoin.decimals)} {window.stableCoin.symbol}</b></h6>
                            </label>
                            {window.walletAddress && <section className="RebalanceEmergency">
                                <label>
                                    <span>&#128293;</span>
                                    <input onChange={this.rebalanceByDebtInputChange} ref={ref => this.rebalanceByDebtInput = ref} />
                                    <span>{window.stableCoin.symbol}</span>
                                </label>
                                <section className="RebalanceEmergencyRew">
                                    <span>Reward: </span>
                                    <span ref={ref => this.debtReward = ref}></span>
                                    <span> {window.dfo.symbol}</span>
                                </section>
                                <a href="javascript:;" onClick={this.rebalanceByDebt} className="StableITBTN">Rebalance</a>
                            </section>}
                        </section>}
                    </section>}
                    <p className="Disclamerone">This protocol is built using a <a target="_blank" href="https://github.com/b-u-i-d-l/responsible-defi">Responsible DeFi</a> approach. But it's new, so use it at your own risk and remember, in Ethereum transactions are irreversible.</p>
                </section>}
                {this.state && this.state.priceInDollars && this.state.priceInDollars > window.context.farmingShowRuleDump && this.state.selectedPair && this.renderDump()}
                {this.state && this.state.priceInDollars && this.state.priceInDollars < window.context.farmingShowRulePump && this.state.selectedPair && this.renderPump()}
                {this.state && this.state.grimoire && <GrimuSD />}
            </section>
        );
    }
});