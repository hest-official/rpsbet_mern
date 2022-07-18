import React, { Component } from 'react';
import Modal from 'react-modal';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel
} from 'react-accessible-accordion';

Modal.setAppElement('#root');

const customStyles = {
  overlay: {
    zIndex: 3,
    backgroundColor: 'rgba(47, 49, 54, 0.8)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    background: 'transparent',
    padding: 0,
    border: 0
  }
};

class HowToPlayModal extends Component {
  render() {
    return (
      <Modal
        isOpen={this.props.modalIsOpen}
        onRequestClose={this.props.closeModal}
        style={customStyles}
        contentLabel="How To Play Modal"
      >
        <div className={this.props.isDarkMode ? 'dark_mode' : ''}>
          <div className="modal-body edit-modal-body how-to-play-modal-body">
            <h2 className="modal-title">Help</h2>

            <button className="btn-close" onClick={this.props.closeModal}>
              ×
            </button>
            <Accordion>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="modal-content-wrapper quick-shoot">
                      <h4>Quick Shoot - Tutorial</h4>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="modal-content-wrapper quick-shoot">
                    <div className="modal-content-panel">
                      <h5>HOST GAME</h5>
                      <ol>
                        <li>
                          Set the Game Type (Returns Multiplier e.g. 2x, 3x
                          etc.)
                        </li>
                        <li>Set Your Bet Amount</li>
                        <li>Choose Where to Save</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5>JOIN GAME</h5>
                      <ol>
                        <li>Choose Where to Shoot</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5 style={{ color: '#02c526' }}>WINNINGS</h5>
                      <p>e.g.</p>
                      <p>
                        Your Bet Amount ={' '}
                        <span style={{ color: '#b52c22' }}>£50</span>
                      </p>
                      <p>
                        Game Type ={' '}
                        <span style={{ color: '#f6b22a' }}>
                          <u>5 (5x)</u>
                        </span>
                      </p>
                      <p>
                        Public Bet Amount ={' '}
                        <span style={{ color: '#b52c22' }}>£200 [£50 * 4]</span>
                      </p>
                      <p>
                        Winnings ={' '}
                        <span style={{ color: '#02c526' }}>
                          £247.50 [£250 * 0.99]
                        </span>
                      </p>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="modal-content-wrapper brain-game">
                      <h4>Brain Game - Tutorial</h4>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="modal-content-wrapper brain-game">
                    <div className="modal-content-panel">
                      <h5>HOST GAME</h5>
                      <ol>
                        <li>Set a global Bet Amount</li>
                        <li>Set Payout for an Automatic cash out (optional)</li>
                        <li>Set a score for players to try beat</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5>JOIN GAME</h5>
                      <ol>
                        <li>Try to Win</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5 style={{ color: '#02c526' }}>WINNINGS</h5>
                      <p>e.g.</p>
                      <p>
                        Bet Amount ={' '}
                        <span style={{ color: '#b52c22' }}>£5</span>
                      </p>
                      <p>
                        Payout ={' '}
                        <span style={{ color: '#f6b22a' }}>Automatic(£30)</span>
                      </p>
                      <p>
                        Winnings ={' '}
                        <span style={{ color: '#02c526' }}>
                          £29.70 [£30 * 0.99]
                        </span>
                      </p>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="modal-content-wrapper mystery-box">
                      <h4>Mystery Box - Tutorial</h4>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="modal-content-wrapper quick-shoot">
                    <div className="modal-content-panel">
                      <h5>HOST GAME</h5>
                      <ol>
                        <li>
                          Add boxes by setting the <u>Prize</u> (or Empty) and{' '}
                          <u>Price</u>{' '}
                          <i>
                            to open. Check the Order of the boxes as the boxes
                            will <u>NOT</u> be randomized.
                          </i>
                        </li>
                        <li>Set Payout for an Automatic cash out (optional)</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5>JOIN GAME</h5>
                      <ol>
                        <li>Open a box and hope to win a Prize</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5 style={{ color: '#02c526' }}>WINNINGS</h5>
                      <p>e.g.</p>
                      <p>
                        The following boxes are set (Prize/Price):{' '}
                        <span style={{ color: '#b52c22' }}>
                          £25/£4, £0/£6, £0/£10
                        </span>
                      </p>
                      <p>
                        Payout ={' '}
                        <span style={{ color: '#f6b22a' }}>
                          Automatic(£41) [£25 + £6 + £10]
                        </span>
                      </p>
                      <p>
                        Host Winnings ={' '}
                        <span style={{ color: '#02c526' }}>
                          £38.95 [£41 * 0.99]
                        </span>
                      </p>
                      <p>
                        <i>
                          If the £25 Prize box is opened, the host still
                          receives the £4 (Price).
                        </i>
                      </p>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="modal-content-wrapper spleesh">
                      <h4>
                        <i>Spleesh!</i> - Tutuorial
                      </h4>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="modal-content-wrapper spleesh">
                    <div className="modal-content-panel">
                      <h5>HOST GAME</h5>
                      <ol>
                        <li>
                          Pick Your Number (Your Bet Amount): 1-10 or 10-100
                        </li>
                        <li>Set Payout for an Automatic cash out (optional)</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5>JOIN GAME</h5>
                      <ol>
                        <li>Guess the Host's Number</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5 style={{ color: '#02c526' }}>WINNINGS</h5>
                      <p>e.g.</p>
                      <p>
                        Host's Number (Bet Amount) ={' '}
                        <span style={{ color: '#b52c22' }}>£7</span>
                      </p>
                      <p>
                        Payout ={' '}
                        <span style={{ color: '#f6b22a' }}>Automatic(£30)</span>
                      </p>
                      <p>
                        Guesses (in order): 1, 2,10,9,5,8-{' '}
                        <i>*Game ENDs automatically*</i>
                      </p>
                      <p>
                        Host Winnings ={' '}
                        <span style={{ color: '#02c526' }}>
                          £41.58 [£42 * 0.99]
                        </span>
                      </p>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="modal-content-wrapper rps">
                      <h4>RPS - Tutorial</h4>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="modal-content-wrapper rps">
                    <div className="modal-content-panel">
                      <h5>HOST GAME</h5>
                      <ol>
                        <li>
                          Set the Game Type (Freeplay to allow players to bet
                          freely; Fixed to have set bets).
                        </li>
                        <li>
                          (skip this step if Game Type is Fixed) Set the
                          Bankroll.
                        </li>
                        <li>Set the runs.</li>
                      </ol>
                    </div>
                    <div className="modal-content-panel">
                      <h5>JOIN GAME</h5>
                      <ol>
                        <li>
                          Rock BEATS Scissors, Paper BEATS Rock and Scissors
                          BEATS Paper!
                        </li>
                      </ol>
                      <h5 style={{ color: '#02c526' }}>WINNINGS</h5>

                      <p>e.g.</p>
                      <p>Game Type = Freeplay</p>
                      <p>
                        Bet Amount ={' '}
                        <span style={{ color: '#b52c22' }}>£50</span>
                      </p>
                      <p>
                        Winnings ={' '}
                        <span style={{ color: '#02c526' }}>
                          £99 [£100 * 0.99]
                        </span>
                      </p>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="modal-content-wrapper provably-fair">
                      <h4>Games of Skill - Provably Fair</h4>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="modal-content-wrapper spleesh">
                    <div className="modal-content-panel">
                      <p>
                        All our games are 100% Player vs. Player(s) and there
                        are zero random factors affecting the outcome of games,
                        players have complete control. Skilled players can
                        increase their chances of Winning. If you want to
                        understand more about provably fair, 'PvP' games, you
                        can go through{' '}
                        <a href="https://bitcointalk.org/index.php?topic=5194336.0">
                          this forum here
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="modal-content-wrapper house-edge">
                      <h4>Fees - House Edge</h4>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="modal-content-wrapper spleesh">
                    <div className="modal-content-panel">
                      <p>
                        The only fees you pay is Winnings Tax i.e., the{' '}
                        <u>House's Edge</u> which is deducted each time you take
                        Winnings.
                      </p>
                      <table id="howto-modal">
                        <tbody>
                          <tr>
                            <th>Deposit Fees</th>
                            <th>House Edge</th>
                            <th>Withdrawal Fees</th>
                          </tr>
                          <tr>
                            <td>
                              <u>NO deposit Fees.</u>
                            </td>
                            <td className="gamemode">1%</td>
                            <td rowSpan="6">
                              <u>NO withdrawal Fees.</u>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionItemHeading>
                  <AccordionItemButton>
                    <div className="modal-content-wrapper support">
                      <h4>Support - Get in Touch</h4>
                    </div>
                  </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
                  <div className="modal-content-wrapper spleesh">
                    <div className="modal-content-panel">
                      <p>
                        For any technical/general problems, please contact{' '}
                        <u style={{ color: '#f5b22d' }}>online@rpsbet.com</u>.
                      </p>
                    </div>
                  </div>
                </AccordionItemPanel>
              </AccordionItem>
            </Accordion>
            <p>
              CRYPTO COMING SOON! FOLLOW FOR MORE UPDATES!!{' '}
              <a
                href="https://www.rps.finance/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.rps.finance/
              </a>
            </p>

            <div id="game_footer_howto">
              <a href="https://discord.gg/94QywhSc4d">DISCORD</a>
              &nbsp;&nbsp;&nbsp;&#10007;&nbsp;&nbsp;&nbsp;
              <a href="https://www.instagram.com/rps.bet/">INSTAGRAM</a>
              &nbsp;&nbsp;&nbsp;&#10007;&nbsp;&nbsp;&nbsp;
              <a href="https://twitter.com/rpsbet">TWITTER</a>
              &nbsp;&nbsp;&nbsp;&#10007;&nbsp;&nbsp;&nbsp;
              <a href="https://www.youtube.com/channel/UCX_VqwBdQsgXyffI1_JmgWg">
                YOUTUBE
              </a>
              &nbsp;&nbsp;&nbsp;&#10007;&nbsp;&nbsp;&nbsp;
              <a href="https://www.reddit.com/user/RPSBet">REDDIT</a>
              &nbsp;&nbsp;&nbsp;&#10007;&nbsp;&nbsp;&nbsp;
              <a href="https://www.tiktok.com/@rpsbet?lang=en">TIKTOK</a>
              &nbsp;&nbsp;&nbsp;&#10007;&nbsp;&nbsp;&nbsp;
              <a href="https://rpsbet.itch.io/">ITCH</a>
              <br />
            </div>
            <div className="game_footer text-center">
              <span>All Rights Reserved, </span>RPSBet © 2021{' '}
              <a
                href="#privacy"
                id="privacy"
                onClick={this.props.openPrivacyModal}
              >
                Privacy
              </a>{' '}
              |{' '}
              <a href="#terms" id="terms" onClick={this.props.openTermsModal}>
                Terms
              </a>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default HowToPlayModal;
