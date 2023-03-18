import { usePageTitle } from "../../../../hooks/usePageTitle";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useBaseUrl } from "../../../../hooks/useBaseUrl";
import Select from "react-select";
import Swal from "sweetalert2";
import CompetitorDetailsCompanyNetWorthList from "./CompetitorDetailsCompanyNetWorthList";
// import { data, map } from "jquery";

const CompetitorDetailsCompanyNetWorthForm = (props) => {
  const { compid } = useParams();
  usePageTitle("Competitor Creation");
  const initialValue = {
    accYearId: null,
    compNo: null,
    accountYear: null,
    accValue: "",
  };
  const [competitorNetWorthInput, setCompetitorNetWorthInput] =
    useState(initialValue);

  const [accountYearList, setAccountYearList] = useState([]);
  const [formIsValid, setFormIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [netWorthList, setNetWorthList] = useState([]);
  const [editYearData, setEditYearData] = useState();
  const [isBtnClicked, setIsBtnClicked] = useState(false);
  const [hasError, setHasError] = useState({
    accountYear: null,
    accValue: null,
  });
  let tokenId = localStorage.getItem("token");
  var dataSet = [];
  let btn_clicked = false;
  const { server1: baseUrl } = useBaseUrl();
  // const navigate = useNavigate();

  useEffect(() => {
    // getCompNo();
    getAccountYearList();
    getNetWorthList();
  }, []);

  const getAccountYearList = async () => {
    const today = new Date();
    let curr_year = today.getFullYear();
    let startYear = 1970;
    let list = [];
    for (var i = curr_year; i >= startYear; i--) {
      let y = i + "-" + (i + 1);
      list.push({ value: y, label: y });
    }
    setAccountYearList(list);
  };
  
  useEffect(() => {
    if (props.compNo) {
      setCompetitorNetWorthInput({
        ...competitorNetWorthInput,
        compNo: props.compNo,
      });
    }
  }, [props.compNo]);

  // const getCompNo = async () => {
  //   await axios
  //     .get(`${baseUrl}/api/competitorprofile/getcompno/${compid}`)
  //     .then((resp) => {
  //       if (resp.data.status === 200) {
  //         setCompetitorNetWorthInput({
  //           ...competitorNetWorthInput,
  //           compNo: resp.data.compNo,
  //         });
  //       }
  //     });
  // };

  //check Form is Valid or not
  useEffect(() => {
    if (hasError.accValue !== true && hasError.accountYear !== true) {
      setFormIsValid(true);
    } else {
      setFormIsValid(false);
    }
  }, [hasError]);

  const getNetWorthList = () => {
    axios
      .get(`${baseUrl}/api/competitordetails/networthlist/${compid}`)
      .then((resp) => {
        let list = [...resp.data.networth];
        let listarr = list.map((item, index) => ({
          ...item,
          buttons: `<i class="fa fa-edit text-primary mx-2 h6" style="cursor:pointer" title="Edit"></i> <i class="fa fa-trash text-danger h6  mx-2" style="cursor:pointer"  title="Delete"></i>`,
          sl_no: index + 1,
        }));
        setNetWorthList(listarr);
      });
  };

  useEffect(() => {
    getAccountYearList();
  }, [competitorNetWorthInput.accYearId]);

  useEffect(() => {
    if (
      competitorNetWorthInput.accYearId !== null &&
      editYearData !== null &&
      accountYearList.length > 0
    ) {
      setCompetitorNetWorthInput((prev) => {
        return {
          ...prev,
          accountYear: accountYearList.find((x) => x.value === editYearData),
        };
      });
    }
  }, [accountYearList]);

  const onEdit = (data) => {
    setFormIsValid(true);
    getAccountYearList();
    setEditYearData(data.accountYear);
    setCompetitorNetWorthInput({
      accYearId: data.id,
      compNo: data.compNo,
      accValue: data.accValue,
    });
  };

  const onDelete = (data) => {
    Swal.fire({
      text: `Are You sure, to delete ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#2fba5f",
      cancelButtonColor: "#fc5157",
    }).then((willDelete) => {
      if (willDelete.isConfirmed) {
        axios
          .delete(`${baseUrl}/api/competitornetworth/${data.id}`)
          .then((resp) => {
            if (resp.data.status === 200) {
              Swal.fire({
                //success msg
                icon: "success",
                title: "Accounting year " + data.accountYear,
                text: `removed!`,
                timer: 2000,
                showConfirmButton: false,
              });
              getNetWorthList();
            } else if (resp.data.status === 404) {
              Swal.fire({
                // error msg
                icon: "error",
                text: resp.data.message,
                showConfirmButton: true,
              });
            } else {
              Swal.fire({
                icon: "error",
                text: "Something went wrong!",
                timer: 2000,
              });
            }
          });
      } else {
        Swal.fire({
          title: "Cancelled",
          icon: "error",
          timer: 1500,
        });
      }
    });
  };

  const selectInputHandler = (value, action) => {
    setCompetitorNetWorthInput({
      ...competitorNetWorthInput,
      [action.name]: value,
    });
    if (value === "" || value === null) {
      setHasError({ ...hasError, [action.name]: true });
    } else {
      setHasError({ ...hasError, [action.name]: false });
    }
  };

  const textInputHandler = (e) => {
    setCompetitorNetWorthInput({
      ...competitorNetWorthInput,
      accValue: e.target.value,
    });

    if (
      !e.target.value === "" ||
      !e.target.value === null ||
      !/^[1-9]{1}[0-9]{0,10}[\.][0-9]{2}$/.test(e.target.value)
    ) {
      setHasError({ ...hasError, accValue: true });
    } else {
      setHasError({ ...hasError, accValue: false });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    setIsBtnClicked(true);
    let tokenId = localStorage.getItem("token");
    const datatosend = {
      compId: compid,
      compNo: competitorNetWorthInput.compNo,
      accValue: competitorNetWorthInput.accValue,
      accountYear: competitorNetWorthInput.accountYear.value,
      tokenId: tokenId,
    };
    if (
      datatosend.compId !== null &&
      datatosend.compNo !== null &&
      datatosend.accValue !== null &&
      datatosend.accountYear !== null
    ) {
      axios
        .post(`${baseUrl}/api/competitornetworth`, datatosend)
        .then((resp) => {
          if (resp.data.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Competitor Networth",
              text: resp.data.message,
              timer: 2000,
            }).then(function () {
              setLoading(false);
              setIsBtnClicked(false);
              setCompetitorNetWorthInput({
                ...competitorNetWorthInput,
                accValue: "",
                accountYear: null,
              });
              getNetWorthList();
            });
          } else if (resp.data.status === 404) {
            Swal.fire({
              icon: "error",
              title: "Competitor Networth",
              text: resp.data.message,
              confirmButtonColor: "#5156ed",
            }).then(function () {
              setLoading(false);
              setIsBtnClicked(false);
            });
          }
        });
    }
  };

  const updateHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    setIsBtnClicked(true);
    let tokenId = localStorage.getItem("token");
    const datatosend = {
      compId: compid,
      compNo: competitorNetWorthInput.compNo,
      accValue: competitorNetWorthInput.accValue,
      accountYear: competitorNetWorthInput.accountYear.value,
      tokenId: tokenId,
    };
    if (
      datatosend.compId !== null &&
      datatosend.compNo !== null &&
      datatosend.accValue !== null &&
      datatosend.accountYear !== null &&
      competitorNetWorthInput.accYearId
    ) {
      axios
        .put(
          `${baseUrl}/api/competitornetworth/${competitorNetWorthInput.accYearId}`,
          datatosend
        )
        .then((resp) => {
          if (resp.data.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Competitor Networth",
              text: resp.data.message,
              timer: 2000,
            }).then(function () {
              setCompetitorNetWorthInput({
                ...competitorNetWorthInput,
                accYearId: null,
                accValue: "",
                accountYear: null,
              });
              getNetWorthList();
              setIsBtnClicked(false);
              setLoading(false);
            });
          } else if (resp.data.status === 404) {
            Swal.fire({
              icon: "error",
              title: "Competitor Networth",
              text: resp.data.errors,
              confirmButtonColor: "#5156ed",
            }).then(function () {
              setLoading(false);
              setIsBtnClicked(false);
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Competitor Networth",
              text: "Something went wrong!",
              confirmButtonColor: "#5156ed",
            }).then(function () {
              setLoading(false);
              setIsBtnClicked(false);
            });
          }
        });
    }
  };

  return (
    <div className="card-body ">
      <form>
        <div className="row align-items-center">
          <div className="inputgroup col-lg-6 mb-4">
            <div className="row align-items-center">
              <div className="col-lg-6 text-dark">
                <label htmlFor="accountYear" className=" pt-1">
                  Accounting Year<span className="text-danger">&nbsp;*</span>
                  <p className="text-info">( Ex : 2022-2023 )</p>
                </label>
              </div>
              <div className="col-lg-6">
                <Select
                  name="accountYear"
                  id="accountYear"
                  isSearchable="true"
                  isClearable="true"
                  options={accountYearList}
                  onChange={selectInputHandler}
                  value={competitorNetWorthInput.accountYear}
                ></Select>

                {hasError.accountYear && (
                  <div className="pt-1">
                    <span className="text-danger font-weight-bold">
                      Select Accounting Year..!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>          

          <div className="inputgroup col-lg-6 mb-4 ">
            <div className="row align-items-center">
              <div className="col-lg-6 text-dark font-weight-bold pt-1">
                <label htmlFor="accValue">
                  Value in Rupees ( &#8377; )
                  <span className="text-danger">&nbsp;*</span>
                  <p className="text-info">( upto : 99,999,999,999.99 )</p>
                </label>
              </div>
              <div className="col-lg-6">
                <input
                  type="text"
                  className="form-control "
                  id="accValue"
                  placeholder="Enter Value...."
                  name="accValue"
                  value={competitorNetWorthInput.accValue}
                  onChange={textInputHandler}
                />

                {hasError.accValue && (
                  <div className="pt-1">
                    <span className="text-danger font-weight-bold">
                      Enter Valid Amount..!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="inputgroup col-lg-12 mb-4 align-items-center">
            <div className="row justify-content-center">
              <button
                className="btn btn-primary"
                disabled={!formIsValid || isBtnClicked === true}
                onClick={
                  !competitorNetWorthInput.accYearId
                    ? submitHandler
                    : updateHandler
                }
              >
                {!competitorNetWorthInput.accYearId
                  ? loading === true
                    ? "Adding...."
                    : "Add"
                  : loading === true
                  ? "Updating...."
                  : "Update"}
              </button>
              {formIsValid && btn_clicked === true}
            </div>
          </div>          
        </div>
      </form>
      <CompetitorDetailsCompanyNetWorthList
        netWorthList={netWorthList}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};
export default CompetitorDetailsCompanyNetWorthForm;
