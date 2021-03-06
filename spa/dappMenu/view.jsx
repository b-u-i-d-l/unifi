var DappMenu = React.createClass({
    requiredModules: [
        'spa/ethereumWalletProvider'
    ],
    requiredScripts: [
        'assets/plugins/ethereumProviders/ethereumProviders.js'
    ],
    getDefaultSubscriptions() {
        return {
            'ethereum/ping': () => this.forceUpdate(),
            'toggle/connect' : connect => this.setState({connect})
        }
    },
    getInitialState() {
        return {
            menuItems: [{
                title: "Stable Coin",
                icon: "m4"
            },
            {
                title: "Swap Bazar",
                icon: "m1"
            }, {
                title: "Grimoire",
                icon: "m0"
            }]
        };
    },
    renderMenuItem(menuItem, i) {
        menuItem.id = menuItem.id || ('id' + (i + 1));
        menuItem.props = menuItem.props || {};
        menuItem.props.id = menuItem.props.id || menuItem.id;
        !menuItem.props.href && (menuItem.props.onClick = menuItem.props.onClick || (() => this.emit('section/change', menuItem.sectionName || menuItem.title.split(' ').join('').firstLetterToLowerCase())));
        menuItem.props.href = menuItem.props.href || "javascript:;";
        menuItem.className = menuItem.className || ("M" + menuItem.title.split(' ').join(''));
        return (
            <li key={menuItem.id} className={menuItem.className}>
                {React.createElement('a', menuItem.props, [
                    <img src={window.resolveImageURL(menuItem.icon)} />,
                    <span>{menuItem.title}</span>
                ])}
                <span className="menuArrow"><img src={window.resolveImageURL(menuItem.arrowkey || 'mk')} /></span>
            </li>
        );
    },
    toggle(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        var _this = this;
        var oldTarget = e.currentTarget;
        var toggleWork = function toggleWork(type) {
            var state = {};
            state[type] = !(_this.state && _this.state[type]);
            _this[type] && delete _this[type].onblur;
            _this.setState(state, function() {
                _this.state[type] && _this[type] && (_this[type].onblur = _this[type].onblur || function(e) {
                    e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
                    e.relatedTarget && e.relatedTarget !== oldTarget && e.relatedTarget.click();
                    e.relatedTarget !== oldTarget && toggleWork(type);
                }) && _this[type].focus();
            });
        };
        toggleWork(e.currentTarget.dataset.type);
    },
    toggleBoomerMode(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('visual/mode/toggle');
    },
    render() {
        return (
            <section className="MenuAll">
                <a className="BoomerModeToggler" href="javascript:;" onClick={this.toggleBoomerMode} ref={ref => ref && (ref.innerHTML = ('&#' + (window.localStorage.boomerMode === 'true' ? '128188' : '10024') + ';'))}></a>
                <a className="maghetto" href=""><img src="assets/img/maghetto.png"></img></a>
                <a href="javascript:;" onClick={this.toggle} data-type="menu" className="menuOpener">Menu</a>
                {!window.walletAddress && <a href="javascript:;" onClick={this.toggle} data-type="connect" className="connectOpener"><img src="assets/img/m6.png"></img><span>Connect</span></a>}
                {window.walletAddress && <a href={window.getNetworkElement("etherscanURL") + "address/" + window.walletAddress} target="_blank" className="connectOpener"><img src={window.makeBlockie(window.walletAddress)}/><span>{window.shortenWord(window.walletAddress, 12)}</span></a>}
                <section className="MenuOpen" style={{"display" : this.props.show ? "inline-block" : this.state && this.state.menu ? "inline-block" : "none"}}>
                    <section ref={ref => this.menu = ref} className="coverMenu" tabIndex="-1">
                        {this.state.menuItems.map(this.renderMenuItem)}
                    </section>
                </section>
                {!window.walletAddress && this.state && this.state.connect && <section ref={ref => this.connect = ref} tabIndex="-1" className="coverConnectMenu">
                    <EthereumWalletProvider className="coverMenu" />
                </section>}
            </section>
        );
    }
});