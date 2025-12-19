-- Table: generic.centretype

DROP TABLE IF EXISTS generic.centretype;

CREATE TABLE IF NOT EXISTS generic.centretype
(
    centretypecode character varying(4) COLLATE pg_catalog."default" NOT NULL,
    centretypedescription character varying(255) COLLATE pg_catalog."default" NOT NULL,
    centretypeshortdescription character varying(20) COLLATE pg_catalog."default" NOT NULL,
    fromdate date NOT NULL,
    todate date,
    userid character varying(7) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime date,
    CONSTRAINT centretype_pkey PRIMARY KEY (centretypecode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.centretype
    OWNER to postgres;

INSERT INTO generic.centretype (centretypecode, centretypedescription, centretypeshortdescription, fromdate, todate, userid, regstatus, regtime)
VALUES ('ISRO', 'Indian Space Research Organisation', 'ISRO', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.centretype (centretypecode, centretypedescription, centretypeshortdescription, fromdate, todate, userid, regstatus, regtime)
VALUES ('DOS', 'Department of Space', 'DOS', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.centretype (centretypecode, centretypedescription, centretypeshortdescription, fromdate, todate, userid, regstatus, regtime)
VALUES ('ABS', 'Autonomous Bodies', 'ABs', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.centretype (centretypecode, centretypedescription, centretypeshortdescription, fromdate, todate, userid, regstatus, regtime)
VALUES ('INSP', 'Indian National Space Promotion and Authorization Center', 'IN-SPACe', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.centretype (centretypecode, centretypedescription, centretypeshortdescription, fromdate, todate, userid, regstatus, regtime)
VALUES ('CPSE', 'Central Public Sector Enterprises', 'CPSEs', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');



-- Table: generic.centresunits

DROP TABLE IF EXISTS generic.centresunits;

CREATE TABLE IF NOT EXISTS generic.centresunits
(
    centrecode character varying(2) COLLATE pg_catalog."default" NOT NULL,
    centrelongname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    centreshortname character varying(100) COLLATE pg_catalog."default",
    centretype character varying(4) COLLATE pg_catalog."default",
    exclusivegroupincentive character varying(3) COLLATE pg_catalog."default",
    status character varying(20) COLLATE pg_catalog."default",
    fromdate date NOT NULL,
    todate date,
    userid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT centresunits_pkey PRIMARY KEY (centrecode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.centresunits
    OWNER to postgres;




INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('01', 'VIKRAM SARABHAI SPACE CENTRE', 'VSSC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('02', 'SATISH DHAWAN SPACE CENTRE', 'SDSC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('03', 'SPACE APPLICATIONS CENTRE', 'SAC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('04', 'U.R. RAO SATELLITE CENTRE', 'URSC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('05', 'PHYSICAL RESEARCH LABORATORY', 'PRL', 'ABS', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('06', 'NATIONAL REMOTE SENSING CENTRE', 'NRSC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('07', 'ISRO TELEMETRY, TRACKING AND TELECOMMAND NETWORK', 'ISTRAC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('08', 'LIQUID PROPULSION SYSTEM CENTRE', 'LPSC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('10', 'MASTER CONTROL FACILITY', 'MCF', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('12', 'DEPARTMENT OF SPACE', 'DOS', 'DOS','No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('13', 'ISRO HEADQUARTERS', 'ISRO HQ', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('15', 'ISRO INERTIAL SYSTEMS UNIT', 'IISU', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('19', 'ADVANCED DATA PROCESSING RESEARCH INSTITUTE', 'ADRIN', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('20', 'NATIONAL ATMOSPHERIC RESEARCH LABORATORY', 'NARL', 'ABS', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('21', 'NORTH EASTERN SPACE APPLICATION CENTRE', 'NE-SAC', 'ABS', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('Z1', 'INDIAN INSTITUTE OF REMOTE SENSING', 'IIRS', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('Z2', 'ISRO PROPULSION COMPLEX', 'IPRC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('Z3', 'HUMAN SPACE FLIGHT CENTRE', 'HSFC', 'ISRO', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.centresunits
(centrecode, centrelongname, centreshortname, centretype, exclusivegroupincentive, status, fromdate, todate, userid, regstatus, regtime)
VALUES('Z4', 'INDIAN NATIONAL SPACE PROMOTION AND AUTHORIZATION CENTER', 'IN-SPACe', 'INSP', 'No', NULL, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');



-- Table: generic.screens

DROP TABLE IF EXISTS generic.screens;

CREATE TABLE IF NOT EXISTS generic.screens
(
    screenid character varying(10) COLLATE pg_catalog."default" NOT NULL,
    screenname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    screencategory character varying(20) COLLATE pg_catalog."default" NOT NULL,
    fromdate date NOT NULL,
    todate date,
    userid character varying(255) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT screens_pkey PRIMARY KEY (screenid)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.screens
    OWNER to postgres;

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('AD001', 'Roles', 'Admin', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('AD002', 'User Roles', 'Admin', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('AD003', 'Screens', 'Admin', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');



INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('GE001', 'Centre Types', 'Generic', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('GE002', 'Centres', 'Generic', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('GE003', 'Objectives', 'Generic', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('GE004', 'Actions', 'Generic', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('GE005', 'Success Indicators', 'Generic', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('OP001', 'Evaluation of minimum sum of weights', 'Operations', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');

INSERT INTO generic.screens
(screenid, screenname, screencategory, fromdate, todate, userid, regstatus, regtime)
VALUES('OP002', 'Targets Setting and updation of targets Achievement', 'Operations', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');



-- Table: generic.roles

DROP TABLE IF EXISTS generic.roles;

CREATE TABLE IF NOT EXISTS generic.roles
(
    rolecode character varying(3) COLLATE pg_catalog."default" NOT NULL,
    roledescription character varying(60) COLLATE pg_catalog."default",
    fromdate date NOT NULL,
    todate date,
    userid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT roles_pkey PRIMARY KEY (rolecode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.roles
    OWNER to postgres;

INSERT INTO generic.roles
(rolecode, roledescription, fromdate, todate, userid, regstatus, regtime)
VALUES('ADM', 'Administrator', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.roles
(rolecode, roledescription, fromdate, todate, userid, regstatus, regtime)
VALUES('USR', 'Defining and Achievement of Targets', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.roles
(rolecode, roledescription, fromdate, todate, userid, regstatus, regtime)
VALUES('APR', 'Approver for Targets', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.roles
(rolecode, roledescription, fromdate, todate, userid, regstatus, regtime)
VALUES('REV', 'Reviewing of Targets and Achievement Assesment', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.roles
(rolecode, roledescription, fromdate, todate, userid, regstatus, regtime)
VALUES('SAN', 'Sanction of Tragets and Award of Percentage', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');



-- Table: generic.userroles

DROP TABLE IF EXISTS generic.userroles;

CREATE TABLE IF NOT EXISTS generic.userroles
(
    loginid character varying(10) COLLATE pg_catalog."default" NOT NULL,
    rolecode character varying(3) COLLATE pg_catalog."default" NOT NULL,
    centrecode character varying(10) COLLATE pg_catalog."default" NOT NULL,
    fromdate date NOT NULL,
    todate date,
    userid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT userroles_pkey PRIMARY KEY (loginid, rolecode, centrecode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.userroles
    OWNER to postgres;



INSERT INTO generic.userroles
(loginid, rolecode, centrecode, fromdate, todate, userid, regstatus, regtime)
VALUES('IS03651', 'ADM', 'All', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.userroles
(loginid, rolecode, centrecode, fromdate, todate, userid, regstatus, regtime)
VALUES('IS04171', 'SAN', 'All', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.userroles
(loginid, rolecode, centrecode, fromdate, todate, userid, regstatus, regtime)
VALUES('SH16029', 'REV', 'All', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.userroles
(loginid, rolecode, centrecode, fromdate, todate, userid, regstatus, regtime)
VALUES('SH16029', 'USR', '13', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO generic.userroles
(loginid, rolecode, centrecode, fromdate, todate, userid, regstatus, regtime)
VALUES('SH15697', 'USR', '04', '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01 00:00:00.000');





-- Table: generic.statuscodes

DROP TABLE IF EXISTS generic.statuscodes;

CREATE TABLE IF NOT EXISTS generic.statuscodes
(
    statuscode character varying(3) COLLATE pg_catalog."default" NOT NULL,
    statusdescription character varying(100) COLLATE pg_catalog."default",
    fromdate date NOT NULL,
    todate date,
    userid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT statuscodes_pkey PRIMARY KEY (statuscode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.statuscodes
    OWNER to postgres;


INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('T01', 'Draft Targets Setting', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('T02', 'Targets Submitted for by Centre Level Approval', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('T03', 'Targets sent for resubmission at Centre Level', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('T04', 'Targets Approved by Centre Level', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('T05', 'Targets Sought for Clarification by HQ/APEX Committee', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('T06', 'Targets forwarded to APEX Committee', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('T07', 'Targets Approved by APEX Committee', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');



INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('A01', 'Daft Targets Achievements is being Carried Out', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('A03', 'Targets Proposed to be Dropped by the Centres', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('A02', 'Targets Achievements Submitted for Centre Level Approval', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('A04', 'Targets Achievements sent for resubmission at Centre Level', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('A05', 'Targets Achievements Approved by Centre Level', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('A06', 'Targets Achievements Sought for Clarification by HQ/APEX Committee', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('A07', 'Targets Achievements forwarded to APEX Committee', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.statuscodes
(statuscode, statusdescription, fromdate, todate, userid, regstatus, regtime)
VALUES('A09', 'Targets Achievements Approved by APEX Committee', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');



-- Table: generic.achievementstatuscodes

DROP TABLE IF EXISTS generic.achievementstatuscodes;

CREATE TABLE IF NOT EXISTS generic.achievementstatuscodes
(
    achievementstatuscode character varying(3) COLLATE pg_catalog."default" NOT NULL,
    achievementstatusdescription character varying(100) COLLATE pg_catalog."default",
	validforpercentage character varying(3) COLLATE pg_catalog."default" NOT NULL,
    fromdate date NOT NULL,
    todate date,
    userid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT achievementstatuscodes_pkey PRIMARY KEY (achievementstatuscode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.achievementstatuscodes
    OWNER to postgres;



INSERT INTO generic.achievementstatuscodes
(achievementstatuscode, achievementstatusdescription, validforpercentage, fromdate, todate, userid, regstatus, regtime)
VALUES('S01', 'Completed', 'Yes', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.achievementstatuscodes
(achievementstatuscode, achievementstatusdescription, validforpercentage, fromdate, todate, userid, regstatus, regtime)
VALUES('S02', 'Dropped', 'No', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');

INSERT INTO generic.achievementstatuscodes
(achievementstatuscode, achievementstatusdescription, validforpercentage, fromdate, todate, userid, regstatus, regtime)
VALUES('S03', 'Not Completed', 'No', '01/01/2025', NULL, 'IS03651', 'R', '01/01/2025');




-- Table: operations.evaluationofminimumsumofweights

DROP TABLE IF EXISTS operations.evaluationofminimumsumofweights;

CREATE TABLE IF NOT EXISTS operations.evaluationofminimumsumofweights
(
    financialyear character varying(9) COLLATE pg_catalog."default" NOT NULL,
	centrecode character varying(2) COLLATE pg_catalog."default" NOT NULL,
	sumofweights numeric(12,2) NOT NULL,
	totalsntposts integer NOT NULL,
	totalvg numeric(12,2) NOT NULL,
	sntbudgetcomponent numeric(12,2) NOT NULL,
	sntprisgibudgetcomponent numeric(12,2) NOT NULL,
    userid character varying(50) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT evaluationofminimumsumofweightss_pkey PRIMARY KEY (financialyear,centrecode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS operations.evaluationofminimumsumofweights
    OWNER to postgres;



INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '19', 197.50, 124, 67.76, 26.68, 9.87, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', 'Z3', 356.00, 475, 243.33, 197.93, 190.13, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', 'Z1', 71.00, 99, 70.65, 22.98, 12.00, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '15', 165.00, 350, 149.01, 129.01, 85.34, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', 'Z2', 304.00, 628, 586.73, 356.27, 278.44, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '13', 130.00, 159, 202.91, 1.00, 1.00, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '07', 198.00, 392, 478.85, 313.85, 234.31, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '08', 427.50, 1146, 1328.27, 959.26, 469.77, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '10', 89.50, 289, 266.97, 176.97, 138.55, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '20', 123.50, 63, 44.69, 28.49, 10.54, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '21', 101.50, 46, 44.00, 29.80, 11.03, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '03', 410.00, 1864, 1406.27, 872.27, 467.61, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '02', 300.00, 1932, 1445.63, 862.62, 339.32, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '04', 416.50, 2381, 1938.20, 1281.59, 813.25, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '01', 408.00, 3634, 2990.87, 1792.69, 792.50, 'IS03651', 'R', '2025-01-01 00:00:00.000');

INSERT INTO operations.evaluationofminimumsumofweights
(financialyear, centrecode, sumofweights, totalsntposts, totalvg, sntbudgetcomponent, sntprisgibudgetcomponent, userid, regstatus, regtime)
VALUES('2025-2026', '06', 190.50, 788, 511.83, 220.66, 168.50, 'IS03651', 'R', '2025-01-01 00:00:00.000');



-- Table: generic.objectives

DROP TABLE IF EXISTS generic.objectives;

CREATE TABLE IF NOT EXISTS generic.objectives
(
    objectivecode character varying(20) COLLATE pg_catalog."default" NOT NULL,
	objectivedescription character varying(255) COLLATE pg_catalog."default" NOT NULL,
    mandatory character varying(3) COLLATE pg_catalog."default",
    multipleentries character varying(3) COLLATE pg_catalog."default",
    predefinedparameters character varying(3) COLLATE pg_catalog."default",
    predefinedreferencevalues character varying(3) COLLATE pg_catalog."default",
	changeintargetcriteria character varying(3) COLLATE pg_catalog."default",
    predefinedactions character varying(3) COLLATE pg_catalog."default",
	weightperinitofactivity character varying(50) COLLATE pg_catalog."default",
	unit character varying(50) COLLATE pg_catalog."default",
    unitpreferred character varying(50) COLLATE pg_catalog."default",
	orderofprint integer NOT NULL,
    fromdate date NOT NULL,
    todate date,
    userid character varying(255) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT objectives_pkey PRIMARY KEY (objectivecode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.objectives
    OWNER to postgres;


INSERT INTO generic.objectives
VALUES ('001A', 'Technology Development Programmes', 'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Success Indicator', 'Date', 'Fixed', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('002A', 'Development Missions (New missions - Launch vehicles and satellites including demonstrators)', 'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Success Indicator', 'Date', 'Default', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('003A', 'Applications: New development Projects/Programmes', 'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Success Indicator', 'Date', 'Default', 3, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('004A', 'Project Activities - LV & Satellite Mission (Service/User missions)', 'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Success Indicator', 'Date', 'Default', 4, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('005A', 'Applications: National / User Projects', 'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Success Indicator', 'Date', 'Fixed', 5, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('006A', 'New Technical Facilities establishment (Files requiring approval of DOS as per delegation of financial powers)', 'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Success Indicator', 'Date', 'Fixed', 6, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('007A', 'Mission operation support for relevant Centres/Units only', 'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Success Indicator', 'Number', 'Default', 7, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('008A', 'Number of Papers expected to be published (Published or listed in SCI)', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 8, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('009A', 'Number of Patents/Trade markers/Design/Copy rights Planned', 'No', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Success Indicator', 'Number', 'Default', 9, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('010A', 'Internal Reports - Technical/Project (With library document number - list to be enclosed)', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 10, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('011A', 'Expenditure Expected against BE allocations', 'Yes', 'No', 'Yes', 'Yes', 'No', 'Yes', 'Action', 'Percentage', 'Fixed', 11, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('012A', 'Number of POs released - FE (Files required approval of Director)', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 12, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('012B', 'Number of POs released - Local (Files required approval of Director)', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 12, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('013A', 'Number of recruitments planned (Centre specific recruitments only)', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 13, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('014A', 'No of Training conducted for External Users/Academia (Project Trainees, interns)/Researchers/etc. as part of capacity building /Outreach programme (For external people only)', 'No', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 14, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('015A', 'Technical Support for Start-ups/NGPEs (JPIP Signed)', 'No', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 15, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('016A', 'External Awards/Recognition received by Individual/Groups in Centre/Unit (Does not include fellowships)', 'No', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 16, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('017A', 'Technology Transfer to Industries through NSIL', 'No', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 17, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('018A', 'What is the number of outside researchers supported who undertook research at Centre/Unit Outside researchers include college teachers, university faculty, doctoral students, scientist from other institutions and industry, including RESPOND & STC projects', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 18, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('019A', 'What percentage of the total salary budget of your Centre/Unit is spent on training (Re-skilled and upskilled) of your staff (Including sponsored higher studies)?', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'Yes', 'Action', 'Percentage', 'Default', 19, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('020A', 'Number of employees trained (Permanent staff of Centre/Unit)', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 20, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('021A', 'Membership/Fellowships received by individual in professional bodies', 'No', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 21, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('022A', 'Reports generated for PMO/MoS/Parliament/Cabinet Secretary/Other Ministries, etc', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 22, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('023A', 'Coordination with other Ministries/Departments (Record of discussion mandatory)', 'No', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 23, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('024A', 'Overall DOS expenditure with respect to Voted', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Percentage', 'Default', 24, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('025A', 'Number of policy papers generated (For HQ only - Technical, Administrative, Managerial)', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 25, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('026A', 'PMC Meeting', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 26, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('027A', 'SPAC 1 and 2 meetings', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 27, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('028A', 'ISRO Council Meetings', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 28, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('029A', 'Space Council Meetings', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 29, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('030A', 'Space Commission Meetings', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 30, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('031A', 'Other major hight level meeting / Reports/Proposal Notes/Strategy plans/Roadmaps generation, etc', 'HQ', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Action', 'Number', 'Default', 31, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.objectives
VALUES ('032X', 'Other parameters of relevance to Centre/Units with the approval of respective Centre/Unit Council for consideration by DOS/ISRO HQ/Apex Committee may be defined with suitable justification', 'No', 'Yes', 'No', 'No', 'Yes', 'No', 'NA', 'All', ' ', 32, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');



-- Table: generic.actions

DROP TABLE IF EXISTS generic.actions;

CREATE TABLE IF NOT EXISTS generic.actions
(
    objectivecode character varying(20) COLLATE pg_catalog."default" NOT NULL,
	actioncode character varying(30) COLLATE pg_catalog."default" NOT NULL,
    actiondescription character varying(255) COLLATE pg_catalog."default" NOT NULL,
    predefinedactions character varying(3) COLLATE pg_catalog."default",
	weightperinitofactivity character varying(50) COLLATE pg_catalog."default",
	orderofprint integer NOT NULL,
	fromdate date NOT NULL,
    todate date,
    userid character varying(255) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT actions_pkey PRIMARY KEY (objectivecode, actioncode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.actions
    OWNER to postgres;






INSERT INTO generic.actions
VALUES ('001A', '001AAXXXXXX', 'Name of the TDP', 'No', 'Success Indicator', 0, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('002A', '002AAXXXXXX', 'Name of the Development Mission', 'No', 'Success Indicator', 0, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('003A', '003AAXXXXXX', 'Name of the New Application', 'No', 'Success Indicator', 0, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('004A', '004AAXXXXXX', 'Description of the Project Activity', 'No', 'Success Indicator', 0, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('005A', '005AAXXXXXX', 'Name of the National / User Project', 'No', 'Success Indicator', 0, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('006A', '006AAXXXXXX', 'Name of the Facility', 'No', 'Success Indicator', 0, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('007A', '007AAXXXXXX', 'Number of Spacecrafts/Launch Vehicles', 'No', 'Success Indicator', 0, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('008A', '008AA000001', 'International Journal', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('008A', '008AA000002', 'National Journal', 'Yes', 'Action', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('008A', '008AA000003', 'International - Conference/Seminars/Symposium', 'Yes', 'Action', 3, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('008A', '008AA000004', 'National - Conference/Seminars/Symposium', 'Yes', 'Action', 4, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('009A', '009AA000001', 'Number of Patents', 'Yes', 'Success Indicator', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('009A', '009AA000002', 'Number of Patents', 'Yes', 'Success Indicator', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('009A', '009AA000003', 'Number of Patents', 'Yes', 'Success Indicator', 3, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('010A', '010AA000001', 'Final Report with Document Number Control', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('011A', '011AA000001', 'Centre/Unit Budget', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('011A', '011AA000002', 'Programme Budget', 'Yes', 'Action', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('012A', '012AA000001', 'PO Release Planned (Number of Files)', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('012B', '012BA000001', 'PO Release Planned (Number of Files)', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('013A', '013AA000001', 'Completion of Recruitment', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('014A', '014AA000001', 'Short Term Training (1-4 Days)', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('014A', '014AA000002', '1-2 Weeks Period Training', 'Yes', 'Action', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('014A', '014AA000003', 'Long Term Training (More than 15 days)', 'Yes', 'Action', 3, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('015A', '015AA000001', 'Testing', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('015A', '015AA000002', 'Design Review', 'Yes', 'Action', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('015A', '015AA000003', 'Other Technical Support', 'Yes', 'Action', 3, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('016A', '016AA000001', 'Awards/Recognition', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('017A', '017AA000001', 'Transfer through NSIL', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('018A', '018AA000001', 'Project Training/Research Thesis Work up to 10', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('018A', '018AA000002', 'Project Training/Research Thesis Work between 11-50', 'Yes', 'Action', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('018A', '018AA000003', 'Project Training/Research Thesis Work >= 51', 'Yes', 'Action', 3, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('019A', '019AA000001', 'Expenditure on Training/Higher Education Sponsorships', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('020A', '020AA000001', 'Short Term Training (1-4 Days)', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('020A', '020AA000002', '1-2 Weeks Period Training', 'Yes', 'Action', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('020A', '020AA000003', 'Long Term Training (More than 15 days - including Sponsored', 'Yes', 'Action', 3, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('021A', '021AA000001', 'International Bodies', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('021A', '021AA000002', 'National Bodies', 'Yes', 'Action', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('022A', '022AA000001', 'Reporting', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('023A', '023AA000001', 'Interactions', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('024A', '024AA000001', 'Expenditure Monitoring', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('025A', '025AA000001', 'National Policy Papers', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('025A', '025AA000002', 'Number of Cases Reviewed', 'Yes', 'Action', 2, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('026A', '026AA000001', 'Meeting and Review of Proposals', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('027A', '027AA000001', 'Meeting and Review of Proposals', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('028A', '028AA000001', 'Number of Cases Reviewed', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('029A', '029AA000001', 'Agenda Notes Generated', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('030A', '030AA000001', 'Agenda Notes Generated', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('031A', '031AA000001', 'Minutes/Reports/Papers', 'Yes', 'Action', 1, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.actions
VALUES ('032X', '032XAXXXXXX', 'Enter Action Description', 'No', 'NA', 0, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');




-- Table: generic.successindicator

DROP TABLE IF EXISTS generic.successindicator;

CREATE TABLE IF NOT EXISTS generic.successindicator
(
    objectivecode character varying(20) COLLATE pg_catalog."default" NOT NULL,
	actioncode character varying(30) COLLATE pg_catalog."default" NOT NULL,
	successindicatorcode character varying(30) COLLATE pg_catalog."default" NOT NULL,
    successindicatordescription character varying(255) COLLATE pg_catalog."default" NOT NULL,
	defaultorfixed character varying(30) COLLATE pg_catalog."default",
	unit character varying(50) COLLATE pg_catalog."default", 
	weightperunitofactivity numeric(12,2) NOT NULL,
    targetcriteriavalueexcellent numeric(12,2) NOT NULL,
	targetcriteriavalueverygood numeric(12,2) NOT NULL,
    targetcriteriavaluegood numeric(12,2) NOT NULL,
	targetcriteriavaluefair numeric(12,2) NOT NULL,
    targetcriteriavaluepoor numeric(12,2) NOT NULL,
	fromdate date NOT NULL,
    todate date,
    userid character varying(255) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT successindicator_pkey PRIMARY KEY (objectivecode, actioncode, successindicatorcode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS generic.successindicator
    OWNER to postgres;



INSERT INTO generic.successindicator
VALUES ('001A', '001AAXXXXXX', 'S01', 'TRL-4: Technology basic validation in a laboratory environme', 'Fixed', 'Date', 0.75, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('001A', '001AAXXXXXX', 'S02', 'TRL-5: Technology basic validation in a relevant environment', 'Fixed', 'Date', 1.5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('001A', '001AAXXXXXX', 'S03', 'TRL-6: Technology model or prototype demonstration in a rele', 'Fixed', 'Date', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('001A', '001AAXXXXXX', 'S04', 'TRL-7: Technology prototype demonstration in an operational', 'Fixed', 'Date', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('001A', '001AAXXXXXX', 'S05', 'TRL-8: Actual technology completed and qualified through tes', 'Fixed', 'Date', 4, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('001A', '001AAXXXXXX', 'S06', 'TRL-9: Actual technology qualified through successful missio', 'Fixed', 'Date', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('002A', '002AAXXXXXX', 'S01', 'Configuration/Design Finalisation', 'Default', 'Date', 10, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('002A', '002AAXXXXXX', 'S02', 'Reediness of the Systems', 'Default', 'Date', 15, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('002A', '002AAXXXXXX', 'S03', 'Integration and Testing', 'Default', 'Date', 10, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('002A', '002AAXXXXXX', 'S04', 'Spacecraft readiness/Demonstration Launch/Readiness of Launc', 'Default', 'Date', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('003A', '003AAXXXXXX', 'S01', 'Conceptualisation/Alrithm', 'Default', 'Date', 10, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('003A', '003AAXXXXXX', 'S02', 'Product Development', 'Default', 'Date', 15, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('003A', '003AAXXXXXX', 'S03', 'Calibration and Validation', 'Default', 'Date', 10, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('003A', '003AAXXXXXX', 'S04', 'Deployment/Operationalisation', 'Default', 'Date', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('004A', '004AAXXXXXX', 'S01', 'Subsystem Design Completion', 'Default', 'Date', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('004A', '004AAXXXXXX', 'S02', 'Subsystem Fabrication/Casting', 'Default', 'Date', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('004A', '004AAXXXXXX', 'S03', 'Satellite Readiness', 'Default', 'Date', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('004A', '004AAXXXXXX', 'S04', 'Subsystem Testing & Delivery to integration/Launch Pad Readi', 'Default', 'Date', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('004A', '004AAXXXXXX', 'S05', 'Integration and Testing', 'Default', 'Date', 4, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('004A', '004AAXXXXXX', 'S06', 'PSR/MRR', 'Default', 'Date', 1, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('004A', '004AAXXXXXX', 'S07', 'Launch/Spacecraft Readiness', 'Default', 'Date', 1, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('005A', '005AAXXXXXX', 'S01', 'Pilot Study of Application', 'Fixed', 'Date', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('005A', '005AAXXXXXX', 'S02', 'Test & Evaluation', 'Fixed', 'Date', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('005A', '005AAXXXXXX', 'S03', 'Demonstration to Ministry/User Agencies', 'Fixed', 'Date', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('005A', '005AAXXXXXX', 'S04', 'Readiness for Operationalisation', 'Fixed', 'Date', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('006A', '006AAXXXXXX', 'S01', 'PO Release', 'Fixed', 'Date', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('006A', '006AAXXXXXX', 'S02', 'Commencement of Civil Works', 'Fixed', 'Date', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('006A', '006AAXXXXXX', 'S03', 'Completion of Civil Works', 'Fixed', 'Date', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('006A', '006AAXXXXXX', 'S04', 'Installation and Commissioning of the Facility', 'Fixed', 'Date', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('006A', '006AAXXXXXX', 'S05', 'Operationalisation of Facility', 'Fixed', 'Date', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('007A', '007AAXXXXXX', 'S01', 'Operation Missions - Monitoring, Control & Operations', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('007A', '007AAXXXXXX', 'S02', 'Contingency support', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('007A', '007AAXXXXXX', 'S03', 'Complex / New Demonstration Mission', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('007A', '007AAXXXXXX', 'S04', 'IOT Support', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('008A', '008AA000001', 'S01', 'Publications', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('008A', '008AA000002', 'S01', 'Publications', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('008A', '008AA000003', 'S01', 'Presentation/Publication', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('008A', '008AA000004', 'S01', 'Presentation/Publication', 'Default', 'Number', 1, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('009A', '009AA000001', 'S01', 'Filed', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('009A', '009AA000002', 'S02', '1st Examination Report', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('009A', '009AA000003', 'S03', 'Granted', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('010A', '010AA000001', 'S01', 'Generation of Reports', 'Default', 'Number', 1, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('011A', '011AA000001', 'S01', 'Expenditure', 'Fixed', 'Percentage', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('011A', '011AA000002', 'S01', 'Expenditure', 'Fixed', 'Percentage', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('012A', '012AA000001', 'S01', 'Release of PO', 'Default', 'Number', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('012B', '012BA000001', 'S01', 'Release of PO', 'Default', 'Number', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('013A', '013AA000001', 'S01', 'Generation of Panel', 'Default', 'Number', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('014A', '014AA000001', 'S01', 'Number of Personnel Trained', 'Default', 'Number', 0.5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('014A', '014AA000002', 'S01', 'Number of Personnel Trained', 'Default', 'Number', 1, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('014A', '014AA000003', 'S01', 'Number of Personnel Trained', 'Default', 'Number', 1.5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('015A', '015AA000001', 'S01', 'Number of Testings Supported', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('015A', '015AA000002', 'S01', 'Number of Design Review Supported', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('015A', '015AA000003', 'S01', 'Number of Other Technical Support Supported', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('016A', '016AA000001', 'S01', 'Total Number of Awards/Recognition Received', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('017A', '017AA000001', 'S01', 'Completion of Transfer', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('018A', '018AA000001', 'S01', 'Completion of Training/Thesis Work', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('018A', '018AA000002', 'S01', 'Completion of Training/Thesis Work', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('018A', '018AA000003', 'S01', 'Completion of Training/Thesis Work', 'Default', 'Number', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('019A', '019AA000001', 'S01', 'Amount on Training/Higher Education Sponsorships', 'Default', 'Percentage', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('020A', '020AA000001', 'S01', 'Number of Personnel Trained', 'Default', 'Number', 1, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('020A', '020AA000002', 'S01', 'Number of Personnel Trained', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('020A', '020AA000003', 'S01', 'Number of Personnel Trained', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('021A', '021AA000001', 'S01', 'Number of Membership/Fellowships', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('021A', '021AA000002', 'S01', 'Number of Membership/Fellowships', 'Default', 'Number', 1, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('022A', '022AA000001', 'S01', 'Number of Reports/Presentation Materials Submitted', 'Default', 'Number', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('023A', '023AA000001', 'S01', 'Record of Discussions/Reports', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('024A', '024AA000001', 'S01', 'Percentage of Expenditure', 'Default', 'Percentage', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('025A', '025AA000001', 'S01', 'Policies/Guideline Papers Generated', 'Default', 'Number', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('025A', '025AA000002', 'S01', 'Internal Policies/Guideline Papers Generated', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('026A', '026AA000001', 'S01', 'Number of Cases Reviewed', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('027A', '027AA000001', 'S01', 'Number of Cases Reviewed', 'Default', 'Number', 2, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('028A', '028AA000001', 'S01', 'Number of Cases Reviewed', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('029A', '029AA000001', 'S01', 'Number of Agenda Notes Generated', 'Default', 'Number', 3, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('030A', '030AA000001', 'S01', 'Number of Agenda Notes Generated', 'Default', 'Number', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('031A', '031AA000001', 'S01', 'Final Minutes/Reports/Papers', 'Default', 'Number', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');


INSERT INTO generic.successindicator
VALUES ('032X', '032XAXXXXXX', 'S01', 'Enter Success Indicator', ' ', 'All', 5, 100, 90, 80, 70, 60, '2025-01-01', NULL, 'IS03651', 'R', '2025-01-01');





-- Table: operations.targetssetandachieveddetails

DROP TABLE IF EXISTS operations.targetssetandachieveddetails;

CREATE TABLE IF NOT EXISTS operations.targetssetandachieveddetails
(
    financialyear character varying(9) COLLATE pg_catalog."default" NOT NULL,
    centrecode character varying(2) COLLATE pg_catalog."default" NOT NULL,
    centreshortname character varying(100) COLLATE pg_catalog."default",
    objectivecode character varying(20) COLLATE pg_catalog."default" NOT NULL,
    objectivedescription character varying(255) COLLATE pg_catalog."default" NOT NULL,
    actioncode character varying(30) COLLATE pg_catalog."default" NOT NULL,
    actiondescription character varying(255) COLLATE pg_catalog."default" NOT NULL,
    successindicatorcode character varying(30) COLLATE pg_catalog."default" NOT NULL,
    successindicatordescription character varying(255) COLLATE pg_catalog."default" NOT NULL,
    unit character varying(50) COLLATE pg_catalog."default",
    targetsetvalue character varying(20) COLLATE pg_catalog."default" NOT NULL,
    weightperunitofactivity numeric(12,2) NOT NULL,
    targetcriteriavalueexcellent character varying(20) COLLATE pg_catalog."default" NOT NULL,
    targetcriteriavalueverygood character varying(20) COLLATE pg_catalog."default",
    targetcriteriavaluegood character varying(20) COLLATE pg_catalog."default",
    targetcriteriavaluefair character varying(20) COLLATE pg_catalog."default",
    targetcriteriavaluepoor character varying(20) COLLATE pg_catalog."default",
    achievementstatuscode character varying(3) COLLATE pg_catalog."default",
    achievementstatusdescription character varying(100) COLLATE pg_catalog."default",
	validforpercentage character varying(3) COLLATE pg_catalog."default" NOT NULL,
    targetvalueachieved character varying(20) COLLATE pg_catalog."default",
    achievementweightperunitofactivity numeric(12,2),
    actualachievementpercentage numeric(12,2),
    statuscode character varying(3) COLLATE pg_catalog."default" NOT NULL,
    statusdescription character varying(100) COLLATE pg_catalog."default",
    remarksofcentres text COLLATE pg_catalog."default",
    remarksofhqorapexcommittee text COLLATE pg_catalog."default",
    centrelevelapproveduserid character varying(10) COLLATE pg_catalog."default",
    departmentlevelapproveduserid character varying(10) COLLATE pg_catalog."default",
    userid character varying(10) COLLATE pg_catalog."default" NOT NULL,
    regstatus character varying(1) COLLATE pg_catalog."default" NOT NULL,
    regtime timestamp without time zone,
    CONSTRAINT targetssetandachieveddetails_pkey PRIMARY KEY (financialyear, centrecode, objectivecode, actioncode, successindicatorcode)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS operations.targetssetandachieveddetails
    OWNER to postgres;



