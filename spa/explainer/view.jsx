var Explainer = React.createClass({
    renderExStableCoin() {
        return this.renderInput("ExStableCoin", "", "a", "InfoButton", "a", "dappButton", "More", "Launch Dapp", "A Stable Coin to Pool Them All", "Unified Stable Dollar (uSD) is a new stablecoin minted by the magic rainbow of Uniswap stablecoin pools. Backed by the power of the Unicorn, uSD is the most secure stablecoin ever. The only way it could be destabilized is if the entire stablecoin industry crashed.", () => this.emit('section/change', 'grimoire', {href: "#grimuSD"}), () => this.emit('section/change', 'stableCoin'));
    },
    renderExDex() {
        return this.renderInput("ExDex", "", "a", "InfoButton", "a", "dappButton", "More", "Launch Dapp", "Swap More Than Just Tokens", "Ancient black magic is unleashing the true power of the Unicorn. Programmable Equities, Token Indexes and NFTs (including ERC 1155 NFTs, thanks to ethArt V2) can now be swapped, on the new Bazaar DEX.", () => this.emit('section/change', 'grimoire', {href: "#grimBaz"}), () => this.emit('section/change', 'swapBazar'));
    },
    renderExGrimoire() {
        return this.renderInput("ExGrimoire", "", "a", "readButton", "a", "gitButton", "Read", "Github", "Unicorn Magic For Dummies", "The Official guide for using Unicorn magic with the DeFi on the top of Uniswap. Grimoire, the best selling book of 2020, is prescribed by all the top wizard Universities, and won this years' Booker Prize.", () => this.emit('section/change', 'Grimoire'), "https://github.com/b-u-i-d-l/unifi");
    },
    renderInput(expFeature, featureIllustration, featureActionA, featureActionAStyle, featureActionB, featureActionBStyle, featureBtnA, featureBtnB, featureTitle, featureDesc, actionA, actionB) {
        return (
            <section className={expFeature + " feature"}>
                <section className="cardinfo">
                    
                    <article className="featureDescription">
                        <h3>{featureTitle}</h3>
                        <p>{featureDesc}</p>
                        <aside className="featureActions">
                            <a href={(typeof actionA).toLowerCase() === "string" ? actionA : "javascript:;"} target={(typeof actionA).toLowerCase() === "string" ? "_blank" : undefined} onClick={(typeof actionA).toLowerCase() === "string" ? undefined : actionA} className={featureActionAStyle + " FancyButton"}>{featureBtnA}</a>
                            <a href={(typeof actionB).toLowerCase() === "string" ? actionB : "javascript:;"} target={(typeof actionB).toLowerCase() === "string" ? "_blank" : undefined} onClick={(typeof actionB).toLowerCase() === "string" ? undefined : actionB} className={featureActionBStyle + " FancyButton"}>{featureBtnB}</a>
                        </aside>
                    </article>
                </section>
            </section>
        );
    },
    openStableCoin(e) {
        e && e.preventDefault && e.preventDefault(true) && e.stopPropagation && e.stopPropagation(true);
        this.emit('section/change', 'stableCoin', {oldStableCoin : true})
    },
    render() {
        return (
            <section className="unifiWelcome">
                <header>
                    <h2>Decentralized Finance on top of Uniswap, doing fantastic things securely</h2>
                </header>
                <DappMenu show={true}/>
                {this.renderExStableCoin()}
                {this.renderExDex()}
                {this.renderExGrimoire()}
                
                <footer>
                    <section>
                        <section className="welcomeLinks">
                            <a target="_blank" href="https://dapp.dfohub.com/?addr=0xbC8E0616A61137E1905adb858963f781934A44eD">DFO Info</a>
                            <a target="_blank" href="https://uniswap.info/token/0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5">Uniswap</a>
                            <a target="_blank" href="https://defipulse.io">DeFi Pulse</a>
                            <a target="_blank" href="javascript:;" onClick={this.openStableCoin}>Redeem from the old StableCoin</a>
                        </section>
                        <p><b>Use at your own risk!</b> This is an R&D project in its early stage [Beta]. Before using Cell related functions, be sure to read the documentation and Smart Contracts code. All of the functions of Cell work on top of Uniswap, so be sure about how Uniswap DeFi protocol works too: <a href="https://docs.ethhub.io/guides/graphical-guide-for-understanding-uniswap/" target="_Blank">Ethhub Uniswap Guide</a> | <a href="https://uniswap.org/docs/v2/advanced-topics/understanding-returns/" target="_Blank">Uniswap Returns Guide</a> | <a href="https://medium.com/@pintail/understanding-uniswap-returns-cc593f3499ef" target="_Blank">Advanced Uniswap Guide</a></p>
                    </section>
                </footer>
            </section>
        );
    }
});